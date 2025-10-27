// src/pages/ProductPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

interface Product {
  id: string;
  name: string;
  code?: string;
  description?: string;
  mrp?: number;
  sale_price?: number;
  images?: string[] | null;
  videos?: string[] | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  sku_code?: string | null;
  cloth_type?: string | null;
  features?: string[] | null;
  similar_products?: string[] | null;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

interface CartItem {
  id: string; // product id
  name: string;
  price: number;
  quantity: number;
  image?: string;
  product_ref?: Product;
}

const LOCAL_CART_KEY = "fl_cart_v1";

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [youMayLike, setYouMayLike] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // fetch auth
    const fetchSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetchProduct(productId);
  }, [productId]);

  const fetchProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `*,
           categories(name),
           `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        const productData: any = data;
        const processedProduct = {
          ...productData,
          images: Array.isArray(productData.images) ? productData.images as string[] : [],
          videos: Array.isArray(productData.videos) ? productData.videos as string[] : [],
          features: Array.isArray(productData.features) ? productData.features as string[] : [],
          similar_products: Array.isArray(productData.similar_products) ? productData.similar_products as string[] : []
        };
        setProduct(processedProduct);
        fetchSimilarAndRelated(processedProduct);
      }
      checkIfInCart(id);
    } catch (err) {
      console.error("Error loading product:", err);
      toast({ title: "Error", description: "Failed to load product", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarAndRelated = async (p: any) => {
    try {
      // similar_products is assumed to be an array of uuids in DB. If empty, fallback to same category.
      let similar: Product[] = [];
      if (p?.similar_products?.length) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .in("id", p.similar_products)
          .limit(8);
        similar = (data || []).map(item => ({
          ...item,
          images: (item.images as string[]) || [],
          videos: (item.videos as string[]) || [],
          features: (item.features as string[]) || [],
          similar_products: (item.similar_products as string[]) || [],
        })) as Product[];
      } else if (p?.category_id) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", p.category_id)
          .neq("id", p.id)
          .limit(8);
        similar = (data || []).map(item => ({
          ...item,
          images: (item.images as any as string[]) || [],
          videos: (item.videos as any as string[]) || [],
          features: (item.features as any as string[]) || [],
          similar_products: (item.similar_products as any as string[]) || [],
        })) as Product[];
      }

      // you may also like: random products from same category/subcategory
      const { data: also } = await supabase
        .from("products")
        .select("*")
        .neq("id", p.id)
        .eq("is_active", true)
        .limit(8);

      setSimilarProducts(similar);
      setYouMayLike((also || []).map(item => ({
        ...item,
        images: (item.images as any as string[]) || [],
        videos: (item.videos as any as string[]) || [],
        features: (item.features as any as string[]) || [],
        similar_products: (item.similar_products as any as string[]) || [],
      })) as Product[]);
    } catch (err) {
      console.error("Error fetching related products", err);
    }
  };

  const readLocalCart = (): CartItem[] => {
    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  };

  const saveLocalCart = (items: CartItem[]) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  };

  const checkIfInCart = async (id: string) => {
    // if logged in, check DB cart table; else localStorage
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (user) {
        // server-side: check cart rows for this user (assumes cart table has user_id or session mapping)
        const { data, error } = await supabase
          .from("cart")
          .select("*")
          .eq("product_id", id)
          .eq("session_id", user.id) // using session_id to store user id — adapt to your schema
          .limit(1);

        if (error) throw error;
        setIsInCart((data?.length || 0) > 0);
      } else {
        const items = readLocalCart();
        setIsInCart(items.some((it) => it.id === id));
      }
    } catch (err) {
      console.error("checkIfInCart error", err);
    }
  };

  const addToCartHandler = async () => {
    if (!product) return;
    try {
      const qty = Math.max(1, quantity);

      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;

      if (user) {
        // insert or update server cart
        const payload = {
          session_id: user.id,
          product_id: product.id,
          quantity: qty,
        };
        // upsert pattern: check existing
        const { data: existing } = await supabase
          .from("cart")
          .select("*")
          .eq("product_id", product.id)
          .eq("session_id", user.id)
          .limit(1);

        if (existing && existing.length > 0) {
          const row = existing[0];
          await supabase.from("cart").update({ quantity: row.quantity + qty }).eq("id", row.id);
        } else {
          await supabase.from("cart").insert([payload]);
        }
        setIsInCart(true);
        toast({ title: "Added", description: "Product added to your cart" });
      } else {
        // guest: store in localStorage
        const items = readLocalCart();
        const idx = items.findIndex((it) => it.id === product.id);
        if (idx >= 0) {
          items[idx].quantity += qty;
        } else {
          items.push({
            id: product.id,
            name: product.name,
            price: Number(product.sale_price || product.mrp || 0),
            quantity: qty,
            image: product.images?.[0] || "",
            product_ref: product,
          });
        }
        saveLocalCart(items);
        setIsInCart(true);
        toast({ title: "Added", description: "Product added to your cart" });
      }
    } catch (err) {
      console.error("Add cart error", err);
      toast({ title: "Error", description: "Failed to add to cart", variant: "destructive" });
    }
  };

  const viewCart = () => {
    navigate("/cart");
  };

  const onQuantityChange = (val: number) => {
    setQuantity(Math.max(1, val));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded mt-4" />
            <div className="h-6 bg-gray-200 rounded mt-4" />
            <div className="h-6 bg-gray-200 rounded mt-2 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6 text-center">
          <p className="text-lg">Product not found.</p>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button variant="link" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Images / gallery */}
          <div className="lg:col-span-1">
            <div className="w-full rounded shadow overflow-hidden">
              <img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {(product.images || []).slice(0, 4).map((img, idx) => (
                <img key={idx} src={img} className="h-20 w-full object-cover rounded" />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {product.sku_code && <p className="text-sm text-muted-foreground">SKU: {product.sku_code}</p>}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">₹{product.sale_price ?? product.mrp ?? 0}</div>
              {product.mrp && product.mrp > (product.sale_price ?? 0) && (
                <div className="text-sm line-through text-muted-foreground">₹{product.mrp}</div>
              )}
              <Badge variant="secondary">{product.is_active ? "In stock" : "Out of stock"}</Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm whitespace-pre-wrap">{product.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => onQuantityChange(Number(e.target.value))}
                className="w-24"
              />
              {!isInCart ? (
                <Button onClick={addToCartHandler} className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              ) : (
                <Button onClick={viewCart} variant="outline">
                  View Cart
                </Button>
              )}
            </div>

            {/* Similar products */}
            <div>
              <h3 className="text-lg font-semibold mt-6">Similar Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {similarProducts.map((p) => (
                  <Card key={p.id} className="cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                    <img src={p.images?.[0] || "/placeholder.svg"} className="h-36 w-full object-cover" />
                    <CardContent>
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-sm">₹{p.sale_price ?? p.mrp ?? 0}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* You may also like */}
            <div>
              <h3 className="text-lg font-semibold mt-6">You may also like</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {youMayLike.map((p) => (
                  <Card key={p.id} className="cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                    <img src={p.images?.[0] || "/placeholder.svg"} className="h-36 w-full object-cover" />
                    <CardContent>
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-sm">₹{p.sale_price ?? p.mrp ?? 0}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
