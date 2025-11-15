-- Add coupon_code to offers table
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS coupon_code text UNIQUE;

-- Create hero_config table for storing hero section slides
CREATE TABLE IF NOT EXISTS public.hero_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_order integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text,
  cta_text text DEFAULT 'Shop Now',
  cta_link text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_config ENABLE ROW LEVEL SECURITY;

-- Policies for hero_config
CREATE POLICY "Anyone can view hero config"
  ON public.hero_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage hero config"
  ON public.hero_config FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_hero_config_updated_at
  BEFORE UPDATE ON public.hero_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_hero_config_active ON public.hero_config(is_active, slide_order);
CREATE INDEX IF NOT EXISTS idx_offers_coupon_code ON public.offers(coupon_code) WHERE coupon_code IS NOT NULL;