// src/pages/CartPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Trash2 } from "lucide-react";

interface CartRow {
  id: string; // product id
  name: string;
  price: number;
  quantity: number;
  image?: string;
  product_ref?: any;
}

const LOCAL_CART_KEY = "fl_cart_v1";

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartRow[]>([]);
  const [user, setUser] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      setUser(session?.session?.user || null);
      await loadCart(session?.session?.user || null);
      await fetchOffers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const readLocalCart = (): CartRow[] => {
    try {
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CartRow[];
    } catch {
      return [];
    }
  };

  const saveLocalCart = (items: CartRow[]) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  };

  const loadCart = async (user: any) => {
    if (user) {
      // load from DB cart table for the user
      const { data, error } = await (supabase as any)
        .from("cart")
        .select(`*, products(*)`)
        .eq("session_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading cart from server", error);
        setCart([]);
        return;
      }

      const rows: CartRow[] = (data || []).map((r: any) => ({
        id: r.product_id,
        name: r.products?.name || "Product",
        price: Number(r.products?.sale_price ?? r.products?.mrp ?? 0),
        quantity: r.quantity || 1,
        image: r.products?.images?.[0] || "",
        product_ref: r.products,
      }));

      setCart(rows);
    } else {
      const items = readLocalCart();
      setCart(items);
    }
  };

  const fetchOffers = async () => {
    // load active cart offers from DB
    try {
      const { data } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .gte("start_date", new Date().toISOString()) // optionally handle
        .order("created_at", { ascending: false });

      setOffers(data || []);
    } catch (err) {
      console.error("Error loading offers", err);
    }
  };

  // compute totals
  const subtotal = useMemo(() => cart.reduce((s, c) => s + c.price * c.quantity, 0), [cart]);
  const discount = useMemo(() => {
    if (!appliedOffer) return 0;
    if (appliedOffer.offer_type === "percentage") {
      return (subtotal * Number(appliedOffer.discount_value)) / 100;
    } else {
      return Number(appliedOffer.discount_value);
    }
  }, [appliedOffer, subtotal]);

  const total = Math.max(0, subtotal - discount);

  // auto-apply an eligible cart offer
  useEffect(() => {
    if (!offers || offers.length === 0) return;
    // simple eligibility: offer.min_order_amount <= subtotal
    const eligible = offers.find((o: any) => {
      const min = Number(o.min_order_amount || 0);
      const active = o.is_active;
      const start = o.start_date ? new Date(o.start_date) : null;
      const end = o.end_date ? new Date(o.end_date) : null;
      const now = new Date();
      if (!active) return false;
      if (start && now < start) return false;
      if (end && now > end) return false;
      return subtotal >= min;
    });
    setAppliedOffer(eligible || null);
  }, [offers, subtotal]);

  const updateQuantity = async (productId: string, qty: number) => {
    if (qty < 1) return;
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (user) {
      // update DB cart
      const { data: existing } = await (supabase as any)
        .from("cart")
        .select("*")
        .eq("session_id", user.id)
        .eq("product_id", productId)
        .limit(1);

      if (existing && existing.length > 0) {
        const row = existing[0];
        await supabase.from("cart").update({ quantity: qty }).eq("id", row.id);
      }
      await loadCart(user);
    } else {
      const items = readLocalCart();
      const idx = items.findIndex((i) => i.id === productId);
      if (idx >= 0) {
        items[idx].quantity = qty;
        saveLocalCart(items);
        setCart([...items]);
      }
    }
  };

  const removeItem = async (productId: string) => {
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (user) {
      const deleteQuery: any = (supabase as any).from("cart").delete();
      const { error } = await deleteQuery.eq("session_id", user.id).eq("product_id", productId);
      if (error) {
        toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
      } else {
        toast({ title: "Removed", description: "Item removed from cart" });
      }
      await loadCart(user);
    } else {
      const items = readLocalCart();
      const filtered = items.filter((i) => i.id !== productId);
      saveLocalCart(filtered);
      setCart(filtered);
      toast({ title: "Removed", description: "Item removed from cart" });
    }
  };

  const onBuyNow = async () => {
    // require login for checkout
    const { data: session } = await supabase.auth.getSession();
    const user = session?.session?.user;
    if (!user) {
      // redirect to login (assume /auth/login)
      toast({ title: "Login required", description: "Please login to proceed to checkout" });
      navigate("/login?redirect=/cart");
      return;
    }

    // proceed to checkout page or create order
    // For demo, navigate to a placeholder /checkout
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const onxNow = () => {
    onBuyNow();
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left: cart items */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

            {cart.length === 0 ? (
              <Card>
                <CardContent className="text-center">
                  <p className="text-lg">Your cart is empty.</p>
                  <div className="mt-4">
                    <Link to="/categories"><Button>Shop Now</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              cart.map((row) => (
                <Card key={row.id} className="mb-3">
                  <CardContent className="flex gap-4 items-center">
                    <img src={row.image || "/placeholder.svg"} alt={row.name} className="h-24 w-24 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-medium">{row.name}</div>
                      <div className="text-sm text-muted-foreground">₹{row.price}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          value={row.quantity}
                          min={1}
                          onChange={(e) => updateQuantity(row.id, Number(e.target.value))}
                          className="w-24"
                        />
                        <Button variant="ghost" onClick={() => removeItem(row.id)}><Trash2 /></Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{(row.price * row.quantity).toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Guest login strip */}
            {!user && cart.length > 0 && (
              <Card className="mt-4">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Login / Signup to unlock more offers</div>
                    <div className="text-sm text-muted-foreground">Login to save your cart and get personalized offers.</div>
                  </div>
                  <Button onClick={() => navigate("/login?redirect=/cart")}>Login / Signup</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* right: summary & offers */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>{cart.length} items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div>Subtotal</div>
                  <div>₹{subtotal.toFixed(2)}</div>
                </div>
                <div className="flex justify-between mt-2">
                  <div>Discount</div>
                  <div>- ₹{discount.toFixed(2)}</div>
                </div>
                <div className="border-t my-3" />
                <div className="flex justify-between font-bold">
                  <div>Total</div>
                  <div>₹{total.toFixed(2)}</div>
                </div>

                {appliedOffer && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <div className="font-medium">Offer applied: {appliedOffer.title}</div>
                    <div className="text-sm text-muted-foreground">Discount: {appliedOffer.offer_type === "percentage" ? `${appliedOffer.discount_value}%` : `₹${appliedOffer.discount_value}`}</div>
                  </div>
                )}

                <div className="mt-4">
                  <Button className="w-full" onClick={onxNow}>Buy Now</Button>
                </div>
              </CardContent>
            </Card>

            {/* Related categories / cross-sell */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Related Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Products related to items in your cart will show here (coming soon).</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
