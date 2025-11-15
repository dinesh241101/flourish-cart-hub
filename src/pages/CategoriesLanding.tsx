import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Header from "@/components/Header";

const CategoriesLanding = () => {
=======
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Grid3X3 } from "lucide-react";

// Small, focused category card component
const CategoryCard = React.memo(function CategoryCard({ category, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="cursor-pointer"
    >
      <Card
        onClick={() => onClick(category.id)}
        className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300"
      >
        <div className="relative h-40 w-full bg-gray-100">
          {/* use native lazy-loading; images should be optimized on storage side */}
          <img
            loading="lazy"
            src={category.image_url || "/placeholder.svg"}
            alt={category.name}
            className="w-full h-full object-cover transform transition-transform duration-500"
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="text-sm sm:text-base font-semibold truncate">{category.name}</h3>
          {category.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description, image_url, is_active, created_at, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(100);

  if (error) throw error;
  return data || [];
};

export default function CategoryLanding() {
>>>>>>> Stashed changes
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

<<<<<<< Updated upstream
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
=======
  // react-query handles caching, deduping and background refresh for us
  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });

  const visibleCategories = useMemo(() => categories, [categories]);

  const handleOpenCategory = (id: string) => {
    // navigate to category products page (keeps existing route pattern)
    navigate(`/category/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Shop by Category</h1>
            <p className="text-sm text-muted-foreground mt-1">Discover curated collections — tap to explore</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => refetch()} className="hidden sm:inline-flex">
              Refresh
            </Button>
            <Button variant="outline" onClick={() => navigate('/all-categories')}>View All</Button>
          </div>
        </div>

        {/* Loading / skeleton state */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                <div className="h-4 mt-3 rounded bg-gray-200 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">We couldn't load categories. Try again.</p>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="py-20 text-center">
            <Grid3X3 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-2">No categories available</h3>
            <p className="text-muted-foreground mb-6">We’re working on adding collections. Check back soon.</p>
            <Button onClick={() => navigate('/')} variant="ghost">Back to home</Button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {visibleCategories.map((category: any, idx: number) => (
              <CategoryCard key={category.id} category={category} onClick={handleOpenCategory} />
            ))}
          </motion.div>
>>>>>>> Stashed changes
        )}
      </div>
    </div>
  );
<<<<<<< Updated upstream
};

export default CategoriesLanding;
=======
}
>>>>>>> Stashed changes
