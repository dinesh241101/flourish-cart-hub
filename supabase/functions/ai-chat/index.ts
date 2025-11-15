import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, action, complaintData, imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Handle complaint registration
    if (action === 'register_complaint' && complaintData) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          customer_id: complaintData.customerId,
          product_id: complaintData.productId,
          order_id: complaintData.orderId,
          complaint_text: complaintData.text,
          image_urls: complaintData.imageUrls || [],
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          response: 'Complaint registered successfully! Your complaint ID is: ' + data.id,
          complaintId: data.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build conversation history with enhanced system prompt
    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant for BMS Store, an e-commerce fashion platform. 
        You can help with:
        1. Product recommendations - suggest products based on user preferences and trends
        2. Complaint registration - help users register complaints about delivered products, collect details like product, order ID, and issue description
        3. AI-powered product search - understand natural language queries to find products
        4. General shopping assistance and answers about orders, shipping, returns
        
        When a user wants to register a complaint:
        - Ask for the order ID, product name, and description of the issue
        - Be empathetic and professional
        - Collect any additional details needed
        - Let them know their complaint will be registered
        
        For product recommendations:
        - Ask about preferences (style, color, size, occasion)
        - Provide specific product suggestions
        - Consider trending items
        
        Be friendly, helpful, and concise in your responses.`
      },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});