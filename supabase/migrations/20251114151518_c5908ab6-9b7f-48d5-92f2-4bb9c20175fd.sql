-- Create app_role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    stock_available INTEGER NOT NULL DEFAULT 0,
    last_added_stock INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trending_products table
CREATE TABLE IF NOT EXISTS public.trending_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (customer profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    whatsapp_number TEXT,
    contact_number TEXT,
    pincode TEXT,
    city TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_city TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_name TEXT NOT NULL,
    offer_type TEXT,
    discount DECIMAL(5, 2),
    product_ids UUID[],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    complaint_text TEXT NOT NULL,
    image_urls TEXT[],
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create home_config table
CREATE TABLE IF NOT EXISTS public.home_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_categories BOOLEAN DEFAULT true,
    show_offers BOOLEAN DEFAULT true,
    show_trending BOOLEAN DEFAULT true,
    featured_category_ids UUID[],
    featured_product_ids UUID[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subcategories
CREATE POLICY "Anyone can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON public.subcategories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for inventory
CREATE POLICY "Anyone can view inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for trending_products
CREATE POLICY "Anyone can view trending" ON public.trending_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage trending" ON public.trending_products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for offers
CREATE POLICY "Anyone can view offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Admins can manage offers" ON public.offers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for complaints
CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can view all complaints" ON public.complaints FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update complaints" ON public.complaints FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for home_config
CREATE POLICY "Anyone can view home config" ON public.home_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage home config" ON public.home_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for analytics
CREATE POLICY "Admins can view analytics" ON public.analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert analytics" ON public.analytics FOR INSERT WITH CHECK (true);

-- Insert sample categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Men''s Fashion', 'Trendy fashion for men', 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891'),
('Women''s Fashion', 'Stylish clothing for women', 'https://images.unsplash.com/photo-1483985988355-763728e1935b'),
('Kids Fashion', 'Comfortable wear for kids', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2'),
('Accessories', 'Fashion accessories and jewelry', 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93'),
('Footwear', 'Shoes and sandals collection', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2')
ON CONFLICT DO NOTHING;

-- Get category IDs for products
DO $$
DECLARE
    cat_mens UUID;
    cat_womens UUID;
    cat_kids UUID;
    cat_accessories UUID;
    cat_footwear UUID;
BEGIN
    SELECT id INTO cat_mens FROM public.categories WHERE name = 'Men''s Fashion' LIMIT 1;
    SELECT id INTO cat_womens FROM public.categories WHERE name = 'Women''s Fashion' LIMIT 1;
    SELECT id INTO cat_kids FROM public.categories WHERE name = 'Kids Fashion' LIMIT 1;
    SELECT id INTO cat_accessories FROM public.categories WHERE name = 'Accessories' LIMIT 1;
    SELECT id INTO cat_footwear FROM public.categories WHERE name = 'Footwear' LIMIT 1;

    -- Insert sample products
    INSERT INTO public.products (name, code, description, category_id, price, status, image_url) VALUES
    ('Classic Cotton T-Shirt', 'MTS001', 'Comfortable cotton t-shirt for men', cat_mens, 29.99, 'active', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'),
    ('Slim Fit Jeans', 'MJN001', 'Stylish slim fit denim jeans', cat_mens, 59.99, 'active', 'https://images.unsplash.com/photo-1542272604-787c3835535d'),
    ('Formal Shirt', 'MFS001', 'Professional formal shirt', cat_mens, 49.99, 'active', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'),
    ('Elegant Evening Dress', 'WED001', 'Beautiful evening dress for women', cat_womens, 89.99, 'active', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae'),
    ('Casual Summer Dress', 'WSD001', 'Light and breezy summer dress', cat_womens, 45.99, 'active', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1'),
    ('Denim Jacket', 'WDJ001', 'Trendy denim jacket', cat_womens, 69.99, 'active', 'https://images.unsplash.com/photo-1551028719-00167b16eac5'),
    ('Kids Cotton Shorts', 'KCS001', 'Comfortable shorts for kids', cat_kids, 19.99, 'active', 'https://images.unsplash.com/photo-1519457431-44ccd64a579b'),
    ('Leather Wallet', 'ACW001', 'Premium leather wallet', cat_accessories, 34.99, 'active', 'https://images.unsplash.com/photo-1627123424574-724758594e93'),
    ('Designer Sunglasses', 'ACS001', 'Stylish UV protection sunglasses', cat_accessories, 79.99, 'active', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083'),
    ('Running Shoes', 'FRS001', 'Comfortable sports shoes', cat_footwear, 89.99, 'active', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff')
    ON CONFLICT (code) DO NOTHING;
END $$;

-- Insert inventory for products
INSERT INTO public.inventory (product_id, stock_available, last_added_stock)
SELECT id, 50 + (random() * 100)::int, 20 + (random() * 30)::int
FROM public.products
ON CONFLICT DO NOTHING;

-- Insert home config
INSERT INTO public.home_config (show_categories, show_offers, show_trending) 
VALUES (true, true, true)
ON CONFLICT DO NOTHING;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();