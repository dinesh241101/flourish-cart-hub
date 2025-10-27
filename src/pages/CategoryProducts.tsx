// src/pages/CategoryProductPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Grid3X3, Search } from "lucide-react";
import Header from "@/components/Header";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string | null;
  parent_id?: string | null;
  is_active?: boolean;
  created_at?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  mrp?: number;
  sale_price?: number;
  images?: string[] | null;
  stock_quantity?: number;
  category_id?: string | null;
  subcategory_id?: string | null;
}

const CategoryProduct: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, Category[]>>({});
  const [productsMap, setProductsMap] = useState<Record<string, Product[]>>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoryId || null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // refs for synchronized scroll
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const productsRef = useRef<HTMLDivElement | null>(null);
  const productSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // if route has categoryId, select it
    if (categoryId) {
      setSelectedCategoryId(categoryId);
      setSelectedSubcategoryId(null);
      // scroll into view once DOM ready
      setTimeout(() => scrollCategoryIntoView(categoryId), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      // fetch categories (top-level)
      const { data: categoriesData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: false }); // default desc as requested

      if (catError) throw catError;
      const cats = categoriesData || [];
      setCategories(cats);

      // build subcategory map: assume parent_id holds parent
      const subMap: Record<string, Category[]> = {};
      cats.forEach((c: any) => {
        const pid = c.parent_id || "root";
        if (!subMap[pid]) subMap[pid] = [];
        subMap[pid].push(c);
      });
      setSubcategoriesMap(subMap);

      // fetch products and map them by category & subcategory
      const { data: productsData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }); // latest first

      if (prodError) throw prodError;
      const prods = (productsData || []).map(p => ({
        ...p,
        images: Array.isArray(p.images) ? p.images as string[] : null
      }));
      setAllProducts(prods);

      const pmap: Record<string, Product[]> = {};
      prods.forEach((p: any) => {
        // primary group: category_id (if missing -> 'uncategorized')
        const catId = p.category_id || "uncategorized";
        if (!pmap[catId]) pmap[catId] = [];
        pmap[catId].push(p);
      });
      setProductsMap(pmap);

      // if no category selected, choose first active top-level
      if (!selectedCategoryId && cats.length > 0) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error("fetchAll error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // scrolls product section into view and highlights category
  const scrollToCategoryProducts = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId(null);
    navigate(`/category/${catId}`, { replace: true });
    const el = productSectionRefs.current[catId];
    if (el && productsRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollCategoryIntoView = (catId: string) => {
    const container = categoriesRef.current;
    const target = container?.querySelector(`[data-cat-id="${catId}"]`) as HTMLElement | null;
    if (target && container) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset = targetRect.left - containerRect.left - container.clientWidth / 2 + targetRect.width / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  };

  // Observe product sections and update selected category as the user scrolls products region
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-section-id");
          if (entry.isIntersecting && id) {
            setSelectedCategoryId(id);
            // also scroll category list to center
            scrollCategoryIntoView(id);
          }
        });
      },
      { root: productsRef.current, rootMargin: "0px 0px -60% 0px", threshold: 0.25 }
    );

    Object.keys(productSectionRefs.current).forEach((k) => {
      const el = productSectionRefs.current[k];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [productsMap, productSectionRefs.current, productsRef.current]);

  const categoriesButtons = (
    <div
      ref={categoriesRef}
      className="flex flex-col md:flex-col gap-3 md:py-4 overflow-auto md:w-56 w-full"
      style={{ maxHeight: "75vh" }}
    >
      {categories.map((cat) => {
        const isActive = selectedCategoryId === cat.id;
        return (
          <motion.div
            key={cat.id}
            data-cat-id={cat.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => scrollToCategoryProducts(cat.id)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
              isActive ? "bg-primary/10 ring-2 ring-primary/20" : "bg-white"
            }`}
          >
            <img
              src={cat.image_url || "/placeholder.svg"}
              alt={cat.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div>
              <div className={`font-medium ${isActive ? "text-primary" : ""}`}>{cat.name}</div>
              {cat.description && <div className="text-xs text-muted-foreground line-clamp-1">{cat.description}</div>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-3 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Shop by Category</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/products")}>
              <Search className="mr-2 h-4 w-4" />
              View all products
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-1 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="md:col-span-5 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Left: categories (sticky on desktop) */}
            <div className="md:col-span-1">
              <div className="sticky top-20">{categoriesButtons}</div>
            </div>

            {/* Right: products grouped by category (scrolls) */}
            <div className="md:col-span-5 overflow-auto" ref={productsRef} style={{ maxHeight: "78vh" }}>
              {categories.map((cat) => {
                const catProducts = productsMap[cat.id] || [];
                // apply optional subcategory filter if selected
                const shownProducts = selectedSubcategoryId
                  ? catProducts.filter((p) => p.subcategory_id === selectedSubcategoryId)
                  : catProducts;

                // store ref for intersection observer
                return (
                  <section
                    key={cat.id}
                    ref={(el: HTMLDivElement | null) => {
                      if (el) productSectionRefs.current[cat.id] = el;
                    }}
                    data-section-id={cat.id}
                    className="mb-10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold">{cat.name}</h2>
                        {cat.description && <div className="text-sm text-muted-foreground">{cat.description}</div>}
                      </div>

                      {/* If cat has subcategories, show dropdown */}
                      {subcategoriesMap[cat.id] && subcategoriesMap[cat.id].length > 0 && (
                        <div>
                          <select
                            className="border rounded px-3 py-1"
                            value={selectedSubcategoryId || ""}
                            onChange={(e) => setSelectedSubcategoryId(e.target.value || null)}
                          >
                            <option value="">All</option>
                            {subcategoriesMap[cat.id].map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {shownProducts.length === 0 ? (
                      <Card className="bg-white p-6">
                        <CardContent>
                          <div className="text-center py-10">
                            <Grid3X3 className="mx-auto mb-3 text-muted-foreground h-12 w-12" />
                            <div className="text-lg font-medium">No products</div>
                            <div className="text-sm text-muted-foreground">We are adding items to this category soon.</div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {shownProducts.map((p) => (
                          <motion.div
                            key={p.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/product/${p.id}`)}
                          >
                            <div className="h-36 w-full relative">
                              <img
                                src={p.images?.[0] || "/placeholder.svg"}
                                alt={p.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="p-3">
                              <div className="font-medium text-sm line-clamp-2">{p.name}</div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="text-primary font-semibold">₹{p.sale_price ?? "-"}</div>
                                <Badge>{p.stock_quantity && p.stock_quantity > 0 ? "In stock" : "Out"}</Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProduct;
