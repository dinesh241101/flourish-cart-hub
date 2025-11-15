import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (id) fetchCategoryProducts();
  }, [id]);

  // Sidebar Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, image_url")
        .eq("is_active", true);

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Products for selected category
  const fetchCategoryProducts = async () => {
    setLoadingProducts(true);
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
      setLoadingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

        {/* MOBILE SCROLLABLE CATEGORY BAR */}
        <div className="md:hidden overflow-x-auto flex gap-3 pb-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/category/${cat.id}`)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl cursor-pointer border
                ${cat.id === id ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}
            >
              <img
                src={cat.image_url || "/placeholder.svg"}
                className="w-12 h-12 object-contain"
              />
              <span className="text-xs mt-1">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* LEFT SIDEBAR (DESKTOP VIEW) */}
        <aside className="hidden md:block w-64 bg-white rounded-xl border shadow-sm h-fit sticky top-20 p-4">
          <h2 className="font-semibold mb-4">Categories</h2>

          {loadingCategories ? (
            <p className="text-gray-400 animate-pulse">Loading...</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <motion.li
                  key={cat.id}
                  whileHover={{ scale: 1.03 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                  ${
                    cat.id === id
                      ? "bg-green-100 border-green-500"
                      : "bg-white hover:bg-gray-100 border-gray-300"
                  }`}
                  onClick={() => navigate(`/category/${cat.id}`)}
                >
                  <img
                    src={cat.image_url || "/placeholder.svg"}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </aside>

        {/* PRODUCT GRID */}
        <section className="flex-1">
          <h1 className="text-2xl font-bold mb-5">Products</h1>

          {loadingProducts ? (
            <p className="animate-pulse text-gray-400">Loading products...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, index) => (
                <motion.div
                  key={p.id}
                  className="bg-white rounded-xl border shadow-sm hover:shadow-xl p-4 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="w-full h-52 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={p.images?.[0] || "/placeholder.svg"}
                      className="h-full object-contain hover:scale-105 transition-transform"
                    />
                  </div>

                  <h3 className="mt-3 text-lg font-semibold">{p.name}</h3>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {p.description?.split("|")[0] || "1 pc"}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">
                      ₹{p.sale_price}
                    </span>
                    <span className="text-gray-400 line-through text-sm">
                      ₹{p.mrp}
                    </span>

                    <span className="ml-auto bg-yellow-300 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                      {Math.round(((p.mrp - p.sale_price) / p.mrp) * 100)}% OFF
                    </span>
                  </div>

                  <div className="mt-3">
                    <Badge
                      className={`px-3 py-1 ${
                        p.stock_quantity > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loadingProducts && products.length === 0 && (
            <p className="text-center mt-10 text-gray-500">
              No products available.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryProducts;
