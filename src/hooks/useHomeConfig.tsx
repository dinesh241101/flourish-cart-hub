import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHomeConfig = () => {
  return useQuery({
    queryKey: ['home-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_config')
        .select('*')
        .single();
      
      if (error) {
        // Return default config if none exists
        return {
          show_categories: true,
          show_offers: true,
          show_trending: true,
          featured_category_ids: [],
          featured_product_ids: []
        };
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useHeroSlides = () => {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_config')
        .select('*')
        .eq('is_active', true)
        .order('slide_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, image_url, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('id, title, description, offer_type, discount_value, coupon_code, start_date, end_date, is_active')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false});
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for offers
  });
};