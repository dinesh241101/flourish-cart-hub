// src/pages/ProductPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description?: string;
  mrp?: number;
  sale_price?: number;
  images?: string[] | null;
  videos?: string[] | null;
  stock_quantity?: number;
  sku_code?: string | null;
  cloth_type?: string | null;
  features?: string[] | null;
  similar_products?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="animate-pulse text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-xl font-bold">Product Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/category">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{product.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="rounded-lg w-full object-cover h-96" />
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <img key={idx} src={img} className="h-20 w-20 object-cover rounded" alt={`${product.name}-${idx}`} />
                ))}
              </div>
            )}
            {product.videos && product.videos.length > 0 && (
              <div className="space-y-2">
                {product.videos.map((v, i) => (
                  <video key={i} src={v} controls className="w-full h-48 rounded" />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              {product.mrp && product.sale_price && product.mrp > product.sale_price && (
                <Badge className="mb-2 bg-red-500">{Math.round(((product.mrp - product.sale_price) / product.mrp) * 100)}% OFF</Badge>
              )}
              <div className="text-3xl font-bold">₹{product.sale_price ?? "-"}</div>
              {product.mrp && product.mrp > product.sale_price && <div className="line-through text-muted-foreground">₹{product.mrp}</div>}
            </div>

            <div className="mb-4 text-gray-700">{product.description}</div>

            <div className="mb-4">
              <div className="text-sm text-muted-foreground">SKU: {product.sku_code || "—"}</div>
              <div className="text-sm text-muted-foreground">Cloth: {product.cloth_type || "—"}</div>
              {/* <div className="text-sm text-muted-foreground">Stock: {product.stock_quantity ?? 0}</div> */}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Features</h4>
                <ul className="list-disc pl-5 text-sm">
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button disabled={!(product.stock_quantity && product.stock_quantity > 0)}>Add to cart</Button>
              <Button variant="outline">Wishlist</Button>
            </div>

            {/* <div className="mt-8 text-xs text-muted-foreground">
              Created: {product.created_at ? new Date(product.created_at).toLocaleString() : "—"}
              <br />
              Updated: {product.updated_at ? new Date(product.updated_at).toLocaleString() : "—"}
            </div> */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductPage;
