import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Filter, Truck, Package, DollarSign } from 'lucide-react';
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

interface ProcessedOrder {
  id: string;
  customer_id: string;
  status: string;
  payment_type: string;
  city: string;
  final_amount: number;
  processed_at: string;
  created_at: string;
  customers?: {
    name: string;
    phone: string;
    address: string;
  };
}

const ProcessedOrders = () => {
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProcessedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    paymentType: 'all',
    city: 'all',
    minAmount: '',
    maxAmount: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProcessedOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchProcessedOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (name, phone, address)
        `)
        .eq('status', 'accepted')
        .not('processed_at', 'is', null)
        .order('processed_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching processed orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch processed orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (filters.paymentType !== 'all') {
      filtered = filtered.filter(order => order.payment_type === filters.paymentType);
    }

    if (filters.city !== 'all') {
      filtered = filtered.filter(order => order.city === filters.city);
    }

    if (filters.minAmount) {
      filtered = filtered.filter(order => order.final_amount >= Number(filters.minAmount));
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(order => order.final_amount <= Number(filters.maxAmount));
    }

    setFilteredOrders(filtered);
  };

  const generateExcel = async () => {
    try {
      // Create CSV content
      const headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'City', 'Amount', 'Payment Type', 'Processed Date'];
      const csvContent = [
        headers.join(','),
        ...filteredOrders.map(order => [
          order.id,
          order.customers?.name || 'N/A',
          order.customers?.phone || 'N/A',
          `"${order.customers?.address || 'N/A'}"`,
          order.city || 'N/A',
          order.final_amount,
          order.payment_type,
          new Date(order.processed_at).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Excel file downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast({
        title: "Error",
        description: "Failed to generate Excel file",
        variant: "destructive",
      });
    }
  };

  const getUniqueValues = (key: string) => {
    const values: string[] = [];
    orders.forEach(order => {
      if (key === 'city' && order.city) {
        values.push(order.city);
      } else if (key === 'payment_type' && order.payment_type) {
        values.push(order.payment_type);
      }
    });
    return [...new Set(values)].filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Processed Orders</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Processed Orders</h1>
        </div>
        <Button onClick={generateExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">Orders ready for delivery</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{filteredOrders.reduce((sum, order) => sum + order.final_amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total order value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COD Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredOrders.filter(order => order.payment_type === 'COD').length}
            </div>
            <p className="text-xs text-muted-foreground">Cash on delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select 
                value={filters.city} 
                onValueChange={(value) => setFilters({...filters, city: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {getUniqueValues('city').map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
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
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Processed Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>Orders that have been accepted and are ready for delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customers?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{order.customers?.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.city || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {order.customers?.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{order.final_amount}</TableCell>
                  <TableCell>
                    <Badge variant={order.payment_type === 'COD' ? 'secondary' : 'default'}>
                      {order.payment_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.processed_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
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

export default ProcessedOrders;