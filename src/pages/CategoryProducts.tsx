import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  sale_price: number;
  mrp: number;
  images: string[];
  stock_quantity: number;
}

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryProducts();
  }, [id]);

  const fetchCategoryProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <p className="text-center mt-20 text-gray-500 animate-pulse">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {products.map((p, index) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm border hover:shadow-lg p-4 cursor-pointer"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              {/* Image */}
              <div className="w-full h-40 flex justify-center items-center overflow-hidden rounded-lg bg-gray-50">
                <img
                  src={p.images?.[0] || "/placeholder.svg"}
                  alt={p.name}
                  loading="lazy"
                  className="object-contain h-full transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Title */}
              <h3 className="mt-3 font-semibold text-lg text-gray-900 line-clamp-2">
                {p.name}
              </h3>

              {/* Weight */}
              <p className="text-sm text-gray-500 mt-1">
                {p.description?.split("|")[0] || "1 unit"}
              </p>

              {/* Pricing */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  ₹{p.sale_price}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  ₹{p.mrp}
                </span>

                <span className="ml-auto bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded text-xs font-semibold">
                  {Math.round(((p.mrp - p.sale_price) / p.mrp) * 100)}% OFF
                </span>
              </div>

              {/* Features */}
              <div className="flex items-center justify-between mt-4 text-xs text-gray-600 border-t pt-3">
                <div>
                  <span className="font-medium block">Premium Quality</span>
                  <span>Expert graded</span>
                </div>

                <div>
                  <span className="font-medium block">Fast Delivery</span>
                  <span>Within 24 hrs</span>
                </div>
              </div>

              {/* Stock */}
              <div className="mt-3">
                <Badge
                  className={`px-3 py-1 ${
                    p.stock_quantity > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.stock_quantity > 0 ? "In stock" : "Out of stock"}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No products found in this category.
          </p>
        )}
      </main>
    </div>
  );
};

export default CategoryProducts;
