-- Add city-based pricing support
-- Add city column to products table for city-specific pricing
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS city text;

-- Add city column to offers table for city-specific offers
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS city text;

-- Create trending_categories table for category selection in trending section
CREATE TABLE IF NOT EXISTS public.trending_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on trending_categories
ALTER TABLE public.trending_categories ENABLE ROW LEVEL SECURITY;

-- Add policies for trending_categories
CREATE POLICY "Trending categories are viewable by everyone"
ON public.trending_categories
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage trending categories"
ON public.trending_categories
FOR ALL
USING (true);

-- Add trigger for updated_at on trending_categories
CREATE TRIGGER update_trending_categories_updated_at
BEFORE UPDATE ON public.trending_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();