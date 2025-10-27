import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Heart,
  ShoppingCart,
  Star,
  Filter,
  SortAsc,
} from "lucide-react";
import Header from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrendingProduct {
  id: string;
  product_id: string;
  sort_order: number;
  products?: {
    id: string;
    name: string;
    code: string;
    sale_price: number;
    mrp: number;
    image_url: string | null;
    images: string[] | null;
    stock_quantity: number;
    categories?: { name: string };
  };
}

const Trending = () => {
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("trending");
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendingProducts();
  }, [sortBy]);

  const fetchTrendingProducts = async () => {
    try {
      let query = supabase
        .from("trending_products")
        .select(`
          *,
          products (
            id,
            name,
            code,
            sale_price,
            mrp,
            image_url,
            images,
            stock_quantity,
            categories (name)
          )
        `)
        .eq("is_active", true);

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("products.sale_price", { ascending: true });
          break;
        case "price-high":
          query = query.order("products.sale_price", { ascending: false });
          break;
        case "name":
          query = query.order("products.name", { ascending: true });
          break;
        default:
          query = query.order("sort_order", { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrendingProducts((data || []).map(item => ({
        ...item,
        products: item.products ? {
          ...item.products,
          images: Array.isArray(item.products.images) ? item.products.images as string[] : null
        } : undefined
      })));
    } catch (error) {
      console.error("Error fetching trending products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch trending products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const sessionId = localStorage.getItem("session_id") || crypto.randomUUID();
      localStorage.setItem("session_id", sessionId);

      const { error } = await supabase
        .from("cart")
        .insert([{
          session_id: sessionId,
          product_id: productId,
          quantity: 1,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added to cart successfully",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const sessionId = localStorage.getItem("session_id") || crypto.randomUUID();
      localStorage.setItem("session_id", sessionId);

      const { error } = await supabase
        .from("wishlist")
        .insert([{
          session_id: sessionId,
          product_id: productId,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added to wishlist",
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Trending Products</h1>
            <Badge variant="secondary">{trendingProducts.length} items</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending Order</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {trendingProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingProducts.map((item, index) => {
              const product = item.products;
              if (!product) return null;

              const discount = product.mrp > product.sale_price
                ? Math.round(((product.mrp - product.sale_price) / product.mrp) * 100)
                : 0;

              return (
                <Card key={item.id} className="group product-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Trending Badge */}
                      <Badge className="absolute top-2 left-2 z-10 bg-accent text-accent-foreground">
                        #{index + 1} Trending
                      </Badge>
                      
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2 z-10">
                          {discount}% OFF
                        </Badge>
                      )}

                      {/* Product Image */}
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-square bg-muted overflow-hidden cursor-pointer">
                          <img
                            src={product.images?.[0] || product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Quick Actions */}
                      <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => addToWishlist(product.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => addToCart(product.id)}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Category */}
                      {product.categories?.name && (
                        <Badge variant="outline" className="mb-2 text-xs">
                          {product.categories.name}
                        </Badge>
                      )}

                      {/* Product Name */}
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Product Code */}
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.code}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-price">₹{product.sale_price}</span>
                          {discount > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center justify-between">
                        <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"} className="text-xs">
                          {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-muted-foreground">4.5</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <TrendingUp className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Trending Products</h2>
            <p className="text-muted-foreground mb-8">
              No products are currently marked as trending.
            </p>
            <Link to="/categories">
              <Button>Explore All Products</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;