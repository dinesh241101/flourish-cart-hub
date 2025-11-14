import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Eye, Truck, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type OrderStatus = 'pending' | 'confirmed' | 'accepted' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer_id: string | null;
  status: OrderStatus;
  payment_type: string;
  payment_status: string;
  city: string | null;
  admin_notes: string | null;
  whatsapp_sent: boolean;
  processed_at: string | null;
  delivered_at: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
    email: string | null;
    phone: string | null;
  };
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [filters, setFilters] = useState({
    paymentType: 'all',
    city: [] as string[],
    minAmount: '',
    maxAmount: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customers (name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (filters.paymentType !== 'all') query = query.eq('payment_type', filters.paymentType);
      if (filters.city.length > 0) query = query.in('city', filters.city);
      if (filters.minAmount) query = query.gte('final_amount', Number(filters.minAmount));
      if (filters.maxAmount) query = query.lte('final_amount', Number(filters.maxAmount));

      const { data, error } = await query;
      if (error) throw error;

      setOrders((data as any || []).map((order: any) => ({
        ...order,
        status: order.status,
        customers: order.customers || null
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleReset = () => {
    setFilters({
      paymentType: 'all',
      city: [],
      minAmount: '',
      maxAmount: ''
    });
    setStatusFilter('all');
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: "Success", description: "Order status updated successfully" });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'processing': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'secondary' as const;
      case 'confirmed':
      case 'processing':
      case 'shipped':
      case 'delivered': return 'default' as const;
      case 'cancelled': return 'destructive' as const;
      default: return 'secondary' as const;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | OrderStatus)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter orders by payment type, city, and amount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Type</label>
              <Select 
                value={filters.paymentType} 
                onValueChange={(value) => setFilters({...filters, paymentType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="COD">COD</SelectItem>
                  <SelectItem value="Prepaid">Prepaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cities</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={filters.city.length > 0 ? filters.city.join(", ") : "Select Cities"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="flex items-center space-x-2 px-2 py-1 cursor-pointer" onClick={() => setFilters({ ...filters, city: [] })}>
                    <input type="checkbox" checked={filters.city.length === 0} readOnly />
                    <span>All Cities</span>
                  </div>
                  {[
                    "Mumbai","Delhi","Bengaluru","Hyderabad","Ahmedabad","Chennai","Kolkata","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik","Faridabad","Meerut","Rajkot","Varanasi","Srinagar","Aurangabad","Dhanbad","Amritsar","Navi Mumbai","Prayagraj","Ranchi","Howrah","Jabalpur","Gwalior","Vijayawada","Jodhpur","Madurai","Raipur","Kota","Chandigarh","Guwahati","Solapur","Hubli–Dharwad","Bareilly","Moradabad","Mysuru","Tiruchirappalli"
                  ].map((city) => (
                    <div key={city} className="flex items-center space-x-2 px-2 py-1 cursor-pointer" onClick={() => {
                      const newCities = filters.city.includes(city)
                        ? filters.city.filter((c) => c !== city)
                        : [...filters.city, city];
                      setFilters({ ...filters, city: newCities });
                    }}>
                      <input type="checkbox" checked={filters.city.includes(city)} readOnly />
                      <span>{city}</span>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Min amount"
                value={filters.minAmount}
                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Max Amount</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Max amount"
                value={filters.maxAmount}
                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>Reset</Button>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        
        {(['pending', 'accepted', 'confirmed', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xl font-bold">{statusCounts[status] || 0}</p>
                <p className="text-sm text-muted-foreground capitalize">{status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Manage customer orders and track delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">#{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">{order.customers?.name || 'Unknown'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customers?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{order.customers?.phone || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">₹{order.final_amount}</div>
                      {order.discount_amount > 0 && (
                        <div className="text-sm text-green-600">-₹{order.discount_amount} discount</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accept</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
