import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import ProductGrid from "@/components/ProductGrid";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, Star, ShoppingBag } from "lucide-react";

const Index = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories with few products inside each
      const { data: categoriesData, error: catError } = await supabase
        .from("categories")
        .select(
          `
          id,
          name,
          is_active,
          products (
            id,
            name,
            price,
            image_url,
            stock_quantity
          )
        `
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(6);

      if (catError) throw catError;

      // Fetch active offers
      const { data: offersData, error: offersError } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString())
        .limit(3);

      if (offersError) throw offersError;

      setCategories(categoriesData || []);
      setOffers(offersData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <Header />

      {/* Hero Section */}
      <HeroSection />

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
                <Card
                  key={offer.id}
                  className="border-primary/20 bg-gradient-to-br from-white to-primary/5"
                >
                  <CardContent className="p-6">
                    <Badge className="mb-3" variant="default">
                      {offer.offer_type === "percentage"
                        ? `${offer.discount_value}% OFF`
                        : `₹${offer.discount_value} OFF`}
                    </Badge>
                    <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {offer.description}
                    </p>
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

      {/* Featured Products by Category */}
      {categories.map((category) => (
        <section key={category.id} className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{category.name}</h2>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/category/${category.id}`)}
              >
                View All
              </Button>
            </div>

            {category.products && category.products.length > 0 ? (
              <ProductGrid products={category.products} />
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No products available
                </h3>
                <p className="text-sm text-muted-foreground">
                  Check back soon for new arrivals!
                </p>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-8 opacity-90">
            Get the latest fashion trends and exclusive offers
          </p>
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
