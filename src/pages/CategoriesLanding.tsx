import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Header from "@/components/Header";

const CategoriesLanding = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, image_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error("Category loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-5">Browse Categories</h1>

        {loading ? (
          <p className="animate-pulse text-gray-400">Loading categories...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="cursor-pointer bg-white shadow-sm hover:shadow-xl border rounded-xl p-3 text-center transition-all"
              >
                <div className="w-full h-28 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={cat.image_url || "/placeholder.svg"}
                    alt={cat.name}
                    className="object-contain h-full"
                  />
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-800">
                  {cat.name}
                </h3>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesLanding;
