import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AIChatbot from "@/components/AIChatbot";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Sparkles, TrendingUp, Star, ShoppingBag } from "lucide-react";
import { useHomeConfig, useCategories, useOffers } from "@/hooks/useHomeConfig";

const Index = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  const { data: homeConfig, isLoading: configLoading } = useHomeConfig();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: offersData, isLoading: offersLoading } = useOffers();

  useEffect(() => {
    fetchProducts();
  }, [categoriesData]);

  const fetchProducts = async () => {
    if (!categoriesData) return;
    
    const finalCategories = [];
    for (let cat of categoriesData) {
      const { data: products } = await supabase
        .from("products")
        .select("id, name, sale_price, mrp, image_url, stock_quantity, category_id")
        .eq("category_id", cat.id)
        .limit(10);

      finalCategories.push({
        ...cat,
        products: products || [],
      });
    }
    setCategories(finalCategories);
  };

  const loading = configLoading || categoriesLoading || offersLoading;
  const showCategories = homeConfig?.show_categories ?? true;
  const showOffers = homeConfig?.show_offers ?? true;
  const offers = offersData || [];

  if (loading) {
    return (
      <div className="animate-pulse p-4 md:p-8 space-y-10">
        <div className="h-48 md:h-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 md:h-40 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // MAIN UI
  // -----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main>
        <HeroSection />

        {/* OFFERS */}
        {showOffers && offers.length > 0 && (
          <section className="py-8 md:py-12 px-4">
            <div className="container mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold">Special Offers</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {offers.slice(0, 6).map((offer) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="shadow-lg rounded-2xl bg-white/70 backdrop-blur-md hover:shadow-xl transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <Badge className="mb-3">
                          {offer.offer_type === "percentage"
                            ? `${offer.discount_value}%`
                            : `₹${offer.discount_value}`}{" "}
                          OFF
                        </Badge>

                        <h3 className="text-lg md:text-xl font-semibold mt-3">
                          {offer.title}
                        </h3>

                        <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-2">
                          {offer.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              {offers.length > 6 && (
                <div className="text-center mt-6">
                  <Button onClick={() => navigate('/offers')} variant="outline">
                    View All Offers
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CATEGORIES GRID */}
        {showCategories && (
          <section className="py-8 md:py-12 px-4">
            <div className="container mx-auto">

            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold">Browse Categories</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {categoriesData?.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    onClick={() => navigate(`/category/${cat.id}`)}
                    className="cursor-pointer rounded-xl md:rounded-2xl bg-white shadow-md overflow-hidden 
                    hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={cat.image_url || "/placeholder.jpg"}
                      className="h-28 md:h-32 w-full object-cover"
                      alt={cat.name}
                    />

                    <div className="p-2 md:p-3 text-center font-semibold text-sm md:text-base">
                      {cat.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>
        )}

        {/* CATEGORY PRODUCTS */}
        {showCategories && categories.map((cat) => (
          <section key={cat.id} className="py-12 px-4 bg-gray-50">
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{cat.name}</h2>
                </div>

                <Button onClick={() => navigate(`/category/${cat.id}`)}>
                  View All
                </Button>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-3">
                {cat.products.length === 0 ? (
                  <div className="text-center py-8 w-full">
                    <ShoppingBag className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No products yet.</p>
                  </div>
                ) : (
                  cat.products.map((prod) => (
                    <motion.div
                      key={prod.id}
                      whileHover={{ scale: 1.05 }}
                      className="min-w-[180px] bg-white rounded-xl shadow p-3 cursor-pointer"
                      onClick={() => navigate(`/product/${prod.id}`)}
                    >
                      <img
                        src={prod.image_url}
                        className="h-40 w-full object-cover rounded-lg"
                      />

                      <h3 className="mt-2 font-semibold text-sm">
                        {prod.name}
                      </h3>

                      <p className="text-primary font-medium">
                        ₹{prod.sale_price}
                      </p>

                      <p className="text-xs line-through text-gray-400">
                        ₹{prod.mrp}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

            </div>
          </section>
        ))}

        {/* NEWSLETTER */}
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                className="px-4 py-3 rounded-lg flex-1 text-black"
                placeholder="Enter your email"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Index;
