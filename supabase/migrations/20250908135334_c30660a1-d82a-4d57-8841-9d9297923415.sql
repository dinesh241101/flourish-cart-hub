-- Create inventory table for stock management
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  quantity_purchased INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart table for user shopping carts
CREATE TABLE public.cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlist table for user wishlists
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trending_products table
CREATE TABLE public.trending_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create combo_products table for product bundles
CREATE TABLE public.combo_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  combo_price NUMERIC NOT NULL,
  original_price NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create combo_product_items table for combo product items
CREATE TABLE public.combo_product_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_product_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.inventory 
ADD CONSTRAINT inventory_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.cart 
ADD CONSTRAINT cart_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.wishlist 
ADD CONSTRAINT wishlist_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.trending_products 
ADD CONSTRAINT trending_products_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.combo_product_items 
ADD CONSTRAINT combo_product_items_combo_product_id_fkey 
FOREIGN KEY (combo_product_id) REFERENCES public.combo_products(id) ON DELETE CASCADE;

ALTER TABLE public.combo_product_items 
ADD CONSTRAINT combo_product_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_reviews 
ADD CONSTRAINT product_reviews_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_product_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory (admin only)
CREATE POLICY "Admin can manage inventory" 
ON public.inventory 
FOR ALL 
USING (true);

-- Create RLS policies for cart (public access by session)
CREATE POLICY "Users can manage their own cart" 
ON public.cart 
FOR ALL 
USING (true);

-- Create RLS policies for wishlist (public access by session)
CREATE POLICY "Users can manage their own wishlist" 
ON public.wishlist 
FOR ALL 
USING (true);

-- Create RLS policies for trending_products
CREATE POLICY "Admin can manage trending products" 
ON public.trending_products 
FOR ALL 
USING (true);

CREATE POLICY "Trending products are viewable by everyone" 
ON public.trending_products 
FOR SELECT 
USING (true);

-- Create RLS policies for combo_products
CREATE POLICY "Admin can manage combo products" 
ON public.combo_products 
FOR ALL 
USING (true);

CREATE POLICY "Combo products are viewable by everyone" 
ON public.combo_products 
FOR SELECT 
USING (true);

-- Create RLS policies for combo_product_items
CREATE POLICY "Admin can manage combo product items" 
ON public.combo_product_items 
FOR ALL 
USING (true);

CREATE POLICY "Combo product items are viewable by everyone" 
ON public.combo_product_items 
FOR SELECT 
USING (true);

-- Create RLS policies for product_reviews
CREATE POLICY "Admin can manage product reviews" 
ON public.product_reviews 
FOR ALL 
USING (true);

CREATE POLICY "Everyone can view approved reviews" 
ON public.product_reviews 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Anyone can create reviews" 
ON public.product_reviews 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX idx_cart_session_id ON public.cart(session_id);
CREATE INDEX idx_cart_product_id ON public.cart(product_id);
CREATE INDEX idx_wishlist_session_id ON public.wishlist(session_id);
CREATE INDEX idx_wishlist_product_id ON public.wishlist(product_id);
CREATE INDEX idx_trending_products_active ON public.trending_products(is_active, sort_order);
CREATE INDEX idx_combo_products_active ON public.combo_products(is_active);
CREATE INDEX idx_product_reviews_product_approved ON public.product_reviews(product_id, is_approved);

-- Create triggers for updated_at columns
CREATE TRIGGER update_inventory_updated_at 
BEFORE UPDATE ON public.inventory 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_updated_at 
BEFORE UPDATE ON public.cart 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trending_products_updated_at 
BEFORE UPDATE ON public.trending_products 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_combo_products_updated_at 
BEFORE UPDATE ON public.combo_products 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at 
BEFORE UPDATE ON public.product_reviews 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();