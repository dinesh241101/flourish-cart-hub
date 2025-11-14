"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Product {
  name: string;
  code: string;
  sale_price: number;
  mrp: number;
  image_url?: string;
  images?: string[];
  stock_quantity?: number;
}

interface CartItem {
  id: string;
  quantity: number;
  created_at: string;
  product_id: string;
  products?: Product;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ensureSession();
    fetchCartItems();
  }, []);

  const ensureSession = () => {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("session_id", sessionId);
    }
  };

  // -----------------------------------------
  // FETCH CART ITEMS (Optimized & Safe)
  // -----------------------------------------
  const fetchCartItems = async () => {
    try {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) return;

      const { data, error } = await supabase
        .from("cart")
        .select(
          `
          *,
          products (
            name,
            code,
            sale_price,
            mrp,
            image_url,
            images,
            stock_quantity
          )
        `
        )
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const cleaned = (data || []).map((item: any) => ({
        ...item,
        products: item.products
          ? {
              ...item.products,
              images: Array.isArray(item.products.images)
                ? item.products.images
                : [],
            }
          : undefined,
      }));

      setCartItems(cleaned);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Unable to load cart items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------
  // CART TOTAL (Memoized for Speed)
  // -----------------------------------------
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.products?.sale_price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  // -----------------------------------------
  // UPDATE QUANTITY
  // -----------------------------------------
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    await supabase.from("cart").update({ quantity }).eq("id", id);
    fetchCartItems();
  };

  // -----------------------------------------
  // REMOVE ITEM
  // -----------------------------------------
  const removeItem = async (id: string) => {
    await supabase.from("cart").delete().eq("id", id);
    fetchCartItems();
  };

  // -----------------------------------------
  // UI COMPONENTS
  // -----------------------------------------

  // 🔄 Loading State — Beautiful Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Header />
        <div className="p-6 space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-800 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  // 🛒 Empty Cart Page (Animated)
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center">
        <motion.img
          src="/empty-cart.png"
          className="w-56 h-56 mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        />
        <motion.h2
          className="text-3xl font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Your cart is empty
        </motion.h2>
        <p className="text-gray-400 mt-2">Add products to continue shopping.</p>

        <Link href="/">
          <Button className="mt-6">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  // 🛍 Cart Items Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-28">
      <Header />

      <div className="p-4 space-y-4">
        {cartItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gray-800 border-gray-700 text-white shadow-lg rounded-2xl">
              <CardContent className="p-4 flex gap-4">
                <Image
                  src={
                    item.products?.image_url ||
                    item.products?.images?.[0] ||
                    "/placeholder.png"
                  }
                  alt={item.products?.name || "Product"}
                  width={100}
                  height={100}
                  className="rounded-xl object-cover"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {item.products?.name}
                  </h3>

                  <div className="text-sm text-gray-300">
                    ₹{item.products?.sale_price}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus size={16} />
                    </Button>

                    <div className="text-base font-semibold">
                      {item.quantity}
                    </div>

                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus size={16} />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      className="ml-auto"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Checkout Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 p-4 flex justify-between items-center">
        <div className="text-lg font-semibold">Total: ₹{totalPrice}</div>

        <Button size="lg" className="px-8">
          Checkout
        </Button>
      </div>
    </div>
  );
}
