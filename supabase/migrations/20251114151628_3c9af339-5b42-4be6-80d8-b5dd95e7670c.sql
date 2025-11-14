-- Add missing columns to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;

-- Add missing columns to inventory
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sku_code TEXT;

-- Create website_config table
CREATE TABLE IF NOT EXISTS public.website_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on website_config
ALTER TABLE public.website_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for website_config
CREATE POLICY "Anyone can view website config" ON public.website_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage website config" ON public.website_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update existing data
UPDATE public.orders SET
    subtotal = amount,
    tax_amount = amount * 0.18,
    shipping_cost = 50
WHERE subtotal IS NULL;

UPDATE public.inventory SET
    cost_price = (SELECT sale_price * 0.6 FROM products WHERE products.id = inventory.product_id),
    created_at = last_updated
WHERE cost_price IS NULL;

UPDATE public.products SET
    base_price = price,
    is_active = (status = 'active'),
    sku_code = code
WHERE base_price IS NULL;