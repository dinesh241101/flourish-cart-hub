-- Add missing columns to products table for enhanced product management
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS mrp numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS images text[], 
ADD COLUMN IF NOT EXISTS videos text[],
ADD COLUMN IF NOT EXISTS product_type text,
ADD COLUMN IF NOT EXISTS sku_code text,
ADD COLUMN IF NOT EXISTS cloth_type text,
ADD COLUMN IF NOT EXISTS features text[],
ADD COLUMN IF NOT EXISTS similar_products uuid[];

-- Rename existing price column to be clearer
ALTER TABLE public.products RENAME COLUMN price TO base_price;

-- Create website_config table for settings
CREATE TABLE IF NOT EXISTS public.website_config (
  key text PRIMARY KEY,
  value text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on website_config
ALTER TABLE public.website_config ENABLE ROW LEVEL SECURITY;

-- Create policy for website_config
CREATE POLICY "Admin can manage website_config" ON public.website_config FOR ALL USING (true);

-- Create order_items table to store individual items in an order
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  quantity integer DEFAULT 1,
  price_per_item numeric DEFAULT 0,
  total_price numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for order_items
CREATE POLICY "Admin can manage order_items" ON public.order_items FOR ALL USING (true);

-- Add more status options and payment info to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'COD',
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS whatsapp_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone;

-- Create analytics summary table for faster queries
CREATE TABLE IF NOT EXISTS public.analytics_summary (
  date date PRIMARY KEY,
  total_orders integer DEFAULT 0,
  delivered_orders integer DEFAULT 0,
  total_customers integer DEFAULT 0,
  total_sales numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on analytics_summary
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics_summary
CREATE POLICY "Admin can view analytics_summary" ON public.analytics_summary FOR SELECT USING (true);
CREATE POLICY "Admin can manage analytics_summary" ON public.analytics_summary FOR ALL USING (true);

-- Add trigger for website_config updated_at
CREATE TRIGGER update_website_config_updated_at
BEFORE UPDATE ON public.website_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for analytics_summary updated_at
CREATE TRIGGER update_analytics_summary_updated_at
BEFORE UPDATE ON public.analytics_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default website configuration
INSERT INTO public.website_config (key, value, description) VALUES
  ('site_name', 'BMS Fashion Store', 'The name of your website'),
  ('site_description', 'Your premier destination for trendy fashion and lifestyle products', 'A brief description of your website'),
  ('contact_email', 'support@bmsfashion.com', 'Primary contact email address'),
  ('contact_phone', '+91 98765 43210', 'Primary contact phone number'),
  ('address', 'Mumbai, Maharashtra, India', 'Business address'),
  ('whatsapp_number', '+91 98765 43210', 'WhatsApp contact number'),
  ('enable_whatsapp_orders', 'true', 'Enable WhatsApp order functionality'),
  ('currency_symbol', '₹', 'Currency symbol to display'),
  ('shipping_charge', '99', 'Default shipping charge'),
  ('free_shipping_threshold', '999', 'Minimum order amount for free shipping')
ON CONFLICT (key) DO NOTHING;