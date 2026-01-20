import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  ChevronRight, 
  Check, 
  Truck,
  Wallet,
  Banknote,
  ArrowLeft,
  Tag
} from 'lucide-react';

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AddressForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  whatsapp_number: string;
}

const LOCAL_CART_KEY = "fl_cart_v1";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Checkout steps
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // User and cart data
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Address form
  const [addressForm, setAddressForm] = useState<AddressForm>({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    whatsapp_number: ''
  });
  
  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Applied offer
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    initCheckout();
  }, []);

  const initCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const currentUser = session?.session?.user;
      
      if (!currentUser) {
        toast({ title: "Login Required", description: "Please login to checkout", variant: "destructive" });
        navigate('/login?redirect=/checkout');
        return;
      }
      
      setUser(currentUser);
      
      // Load user profile for address
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (userProfile) {
        setAddressForm({
          name: userProfile.name || '',
          phone: userProfile.contact_number || '',
          address: userProfile.address || '',
          city: userProfile.city || '',
          pincode: userProfile.pincode || '',
          whatsapp_number: userProfile.whatsapp_number || userProfile.contact_number || ''
        });
      }
      
      // Load cart items
      await loadCart(currentUser.id);
      
    } catch (err) {
      console.error('Checkout init error:', err);
      toast({ title: "Error", description: "Failed to initialize checkout", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCart = async (userId: string) => {
    try {
      // Try loading from database first
      const { data, error } = await supabase
        .from('cart')
        .select(`*, products(*)`)
        .eq('user_id', userId);
      
      if (!error && data && data.length > 0) {
        const items: CartItem[] = data.map((r: any) => ({
          id: r.id,
          product_id: r.product_id,
          name: r.products?.name || 'Product',
          price: Number(r.products?.sale_price ?? r.products?.mrp ?? r.products?.price ?? 0),
          quantity: r.quantity || 1,
          image: r.products?.images?.[0] || r.products?.image_url || ''
        }));
        setCartItems(items);
        return;
      }
      
      // Fallback to localStorage
      const raw = localStorage.getItem(LOCAL_CART_KEY);
      if (raw) {
        const localCart = JSON.parse(raw);
        setCartItems(localCart);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  // Calculate totals
  const subtotal = useMemo(() => cartItems.reduce((s, c) => s + c.price * c.quantity, 0), [cartItems]);
  
  const discount = useMemo(() => {
    if (!appliedOffer) return 0;
    if (appliedOffer.offer_type === 'percentage') {
      const discountAmount = (subtotal * Number(appliedOffer.discount_value)) / 100;
      // Apply max discount limit if exists
      if (appliedOffer.max_discount_amount) {
        return Math.min(discountAmount, Number(appliedOffer.max_discount_amount));
      }
      return discountAmount;
    }
    return Number(appliedOffer.discount_value || 0);
  }, [appliedOffer, subtotal]);
  
  const shippingCost = subtotal > 500 ? 0 : 50;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Error", description: "Please enter a coupon code", variant: "destructive" });
      return;
    }

    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('coupon_code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({ title: "Invalid Coupon", description: "Coupon code is not valid or has expired", variant: "destructive" });
        return;
      }

      // Check validity dates
      const now = new Date();
      if (data.start_date && new Date(data.start_date) > now) {
        toast({ title: "Coupon Not Active", description: "This coupon is not yet active", variant: "destructive" });
        return;
      }
      if (data.end_date && new Date(data.end_date) < now) {
        toast({ title: "Coupon Expired", description: "This coupon has expired", variant: "destructive" });
        return;
      }

      // Check minimum order amount
      const minAmount = Number(data.min_order_amount || 0);
      if (subtotal < minAmount) {
        toast({
          title: "Minimum Order Not Met",
          description: `Minimum order amount of ₹${minAmount} required`,
          variant: "destructive",
        });
        return;
      }

      setAppliedOffer(data);
      toast({ title: "Success", description: "Coupon applied successfully!" });
      setCouponCode('');
    } catch (err) {
      toast({ title: "Error", description: "Failed to apply coupon", variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedOffer(null);
    toast({ title: "Removed", description: "Coupon removed" });
  };

  const validateAddress = () => {
    if (!addressForm.name.trim()) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return false;
    }
    if (!addressForm.phone.trim() || addressForm.phone.length < 10) {
      toast({ title: "Error", description: "Please enter a valid phone number", variant: "destructive" });
      return false;
    }
    if (!addressForm.address.trim()) {
      toast({ title: "Error", description: "Please enter your address", variant: "destructive" });
      return false;
    }
    if (!addressForm.city.trim()) {
      toast({ title: "Error", description: "Please enter your city", variant: "destructive" });
      return false;
    }
    if (!addressForm.pincode.trim() || addressForm.pincode.length !== 6) {
      toast({ title: "Error", description: "Please enter a valid 6-digit pincode", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateAddress()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  const placeOrder = async () => {
    if (!user) {
      toast({ title: "Error", description: "Please login to place order", variant: "destructive" });
      return;
    }

    if (cartItems.length === 0) {
      toast({ title: "Error", description: "Your cart is empty", variant: "destructive" });
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Update user profile with address
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: addressForm.name,
          contact_number: addressForm.phone,
          address: addressForm.address,
          city: addressForm.city,
          pincode: addressForm.pincode,
          whatsapp_number: addressForm.whatsapp_number || addressForm.phone
        }, { onConflict: 'id' });

      // Create order
      const orderId = generateOrderId();
      const shippingAddress = `${addressForm.name}, ${addressForm.address}, ${addressForm.city} - ${addressForm.pincode}, Phone: ${addressForm.phone}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          customer_id: user.id,
          amount: subtotal,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          final_amount: total,
          shipping_address: shippingAddress,
          city: addressForm.city,
          customer_city: addressForm.city,
          payment_type: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
      
      localStorage.removeItem(LOCAL_CART_KEY);

      // Update offer usage if applied
      if (appliedOffer) {
        await supabase
          .from('offers')
          .update({ used_count: (appliedOffer.used_count || 0) + 1 })
          .eq('id', appliedOffer.id);
      }

      toast({ 
        title: "Order Placed Successfully! 🎉", 
        description: `Your order #${orderId} has been placed.` 
      });

      // Navigate to success page or home
      navigate('/', { state: { orderSuccess: true, orderId } });

    } catch (err) {
      console.error('Order placement error:', err);
      toast({ title: "Error", description: "Failed to place order. Please try again.", variant: "destructive" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-4 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-4 md:p-6 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some products to continue</p>
          <Button onClick={() => navigate('/categories')}>Continue Shopping</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { step: 1, label: 'Address', icon: MapPin },
              { step: 2, label: 'Payment', icon: CreditCard },
              { step: 3, label: 'Review', icon: ShoppingBag }
            ].map(({ step, label, icon: Icon }) => (
              <React.Fragment key={step}>
                <div 
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                    currentStep >= step 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="hidden md:inline font-medium">{label}</span>
                  <span className="md:hidden font-medium">{step}</span>
                </div>
                {step < 3 && (
                  <ChevronRight className={`h-5 w-5 ${currentStep > step ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                  <CardDescription>Enter your shipping address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="House/Flat No., Building, Street, Area"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Enter your city"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="6-digit pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="For order updates"
                      value={addressForm.whatsapp_number}
                      onChange={(e) => setAddressForm({ ...addressForm, whatsapp_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>Choose how you want to pay</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 rounded-full bg-amber-100">
                          <Banknote className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                        </div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 rounded-full bg-purple-100">
                          <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">UPI Payment</div>
                          <div className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm, etc.</div>
                        </div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="p-2 rounded-full bg-blue-100">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Delivery Address Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Delivery Address
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium">{addressForm.name}</p>
                      <p className="text-muted-foreground">{addressForm.address}</p>
                      <p className="text-muted-foreground">{addressForm.city} - {addressForm.pincode}</p>
                      <p className="text-muted-foreground">Phone: {addressForm.phone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                      {paymentMethod === 'upi' && '📱 UPI Payment'}
                      {paymentMethod === 'card' && '💳 Credit/Debit Card'}
                    </p>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order Items ({cartItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <img 
                          src={item.image || '/placeholder.svg'} 
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button onClick={handleNextStep} className="flex-1">
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={placeOrder} 
                  className="flex-1"
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>Placing Order...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Place Order • ₹{total.toFixed(2)}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items Preview */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center text-sm">
                      <img 
                        src={item.image || '/placeholder.svg'} 
                        alt={item.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Coupon Code */}
                {!appliedOffer ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Have a coupon?
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={applyCoupon} disabled={couponLoading}>
                        {couponLoading ? '...' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800 text-sm">🎉 {appliedOffer.coupon_code}</p>
                        <p className="text-xs text-green-600">
                          {appliedOffer.offer_type === 'percentage' 
                            ? `${appliedOffer.discount_value}% off` 
                            : `₹${appliedOffer.discount_value} off`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-red-500 h-8">
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      Shipping
                    </span>
                    <span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingCost}`}</span>
                  </div>
                  {subtotal <= 500 && (
                    <p className="text-xs text-muted-foreground">Free shipping on orders above ₹500</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
