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

const Index = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomepageData();
  }, []);

  // -----------------------------------------------------
  // FIXED CATEGORY + PRODUCTS FETCHING
  // -----------------------------------------------------
  const fetchHomepageData = async () => {
    try {
      // FIX 1: clean join instead of relation shorthand
      const { data: categoryData, error: categoryErr } = await supabase
        .from("categories")
        .select("id, name, image_url, is_active")
        .eq("is_active", true);

      if (categoryErr) {
        console.error("Category fetch error:", categoryErr);
      }

      // fetch products for each category FIX 2
      const finalCategories = [];

      for (let cat of categoryData || []) {
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

      // fetch offers
      const { data: offerData } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .gte("end_date", new Date().toISOString());

      setCategories(finalCategories);
      setOffers(offerData || []);
    } catch (e) {
      console.error("Homepage load error:", e);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // SKELETON LOADING
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className="animate-pulse p-8 space-y-10">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-40 bg-gray-200 rounded-xl"></div>
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
        {offers.length > 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Special Offers</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="shadow-lg rounded-2xl bg-white/70 backdrop-blur-md">
                      <CardContent className="p-6">
                        <Badge>
                          {offer.offer_type === "percentage"
                            ? `${offer.discount_value}%`
                            : `₹${offer.discount_value}`}{" "}
                          OFF
                        </Badge>

                        <h3 className="text-xl font-semibold mt-3">
                          {offer.title}
                        </h3>

                        <p className="text-sm text-gray-600 mt-2">
                          {offer.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CATEGORIES GRID */}
        <section className="py-12 px-4">
          <div className="container mx-auto">

            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Browse Categories</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    onClick={() => navigate(`/category/${cat.id}`)}
                    className="cursor-pointer rounded-2xl bg-white shadow-md overflow-hidden 
                    hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={cat.image_url || "/placeholder.jpg"}
                      className="h-32 w-full object-cover"
                    />

                    <div className="p-3 text-center font-semibold">
                      {cat.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* CATEGORY PRODUCTS */}
        {categories.map((cat) => (
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
