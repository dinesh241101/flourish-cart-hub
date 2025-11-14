-- Enable RLS on subcategories table
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Add policies for subcategories
CREATE POLICY "Subcategories are viewable by everyone"
ON public.subcategories
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage subcategories"
ON public.subcategories
FOR ALL
USING (true);