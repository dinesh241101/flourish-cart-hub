import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

const CategoriesLanding = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6 text-gray-900"
        >
          Shop by Category
        </motion.h1>

        {/* Loading State */}
        {isLoading && (
          <p className="text-center text-gray-500 animate-pulse">
            Loading categories...
          </p>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                className="cursor-pointer shadow-md hover:shadow-xl rounded-xl bg-white overflow-hidden border"
                onClick={() => navigate(`/category/${cat.id}`)}
              >
                <div className="h-32 sm:h-36 w-full overflow-hidden">
                  <img
                    src={cat.image_url || "/placeholder.svg"}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-110 duration-500"
                  />
                </div>

                <div className="p-3 text-center">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {cat.name}
                  </h3>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {categories.length === 0 && !isLoading && (
          <p className="text-center mt-10 text-gray-500">
            No categories available.
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoriesLanding;
