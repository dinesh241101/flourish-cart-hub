
import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, TrendingUp, Star, ShoppingBag } from 'lucide-react';

const Index = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(6);

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch active offers
      const { data: offersData } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .limit(3);

      setCategories(categoriesData || []);
      setProducts(productsData || []);
      setOffers(offersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Fashion Trends 2024",
      subtitle: "Discover the Latest Collections"
    },
    {
      url: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      title: "Summer Collection",
      subtitle: "Light, Breezy & Stylish"
    },
    {
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Luxury Fashion",
      subtitle: "Premium Quality & Design"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection images={heroImages} />

      {/* Active Offers */}
      {offers.length > 0 && (
        <section className="py-8 px-4 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Special Offers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offers.map((offer: any) => (
                <Card key={offer.id} className="border-primary/20 bg-gradient-to-br from-white to-primary/5">
                  <CardContent className="p-6">
                    <Badge className="mb-3" variant="default">
                      {offer.offer_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                    </Badge>
                    <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                    <p className="text-xs text-primary font-medium">
                      Min. order: ₹{offer.min_order_amount}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Shop by Category</h2>
            </div>
            <CategoryGrid categories={categories} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Featured Products</h2>
            </div>
            <Button variant="outline">View All</Button>
          </div>
          
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No products available</h3>
              <p className="text-sm text-muted-foreground">Check back soon for new arrivals!</p>
            </div>
          )}
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-8 opacity-90">Get the latest fashion trends and exclusive offers</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button variant="secondary" className="px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
