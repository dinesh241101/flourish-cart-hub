import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, TrendingUp, Package, Users, DollarSign, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalSales: number;
  profit: number;
  dailyOrders: Array<{ date: string; orders: number; sales: number }>;
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalOrders: 0,
    deliveredOrders: 0,
    totalCustomers: 0,
    totalSales: 0,
    profit: 0,
    dailyOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      // Fetch total orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch total customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id');

      if (customersError) throw customersError;

      // Calculate analytics
      const totalOrders = orders?.length || 0;
      const deliveredOrders = orders?.filter(order => order.status === 'delivered').length || 0;
      const totalCustomers = customers?.length || 0;
      const totalSales = orders?.reduce((sum, order) => sum + Number(order.final_amount), 0) || 0;
      
      // Calculate profit (assuming 30% margin)
      const profit = totalSales * 0.3;

      // Daily orders data
      const dailyOrdersMap = new Map();
      orders?.forEach(order => {
        const date = new Date(order.created_at).toDateString();
        if (!dailyOrdersMap.has(date)) {
          dailyOrdersMap.set(date, { orders: 0, sales: 0 });
        }
        const dayData = dailyOrdersMap.get(date);
        dayData.orders += 1;
        dayData.sales += Number(order.final_amount);
      });

      const dailyOrders = Array.from(dailyOrdersMap.entries()).map(([date, data]) => ({
        date,
        orders: data.orders,
        sales: data.sales
      }));

      setAnalyticsData({
        totalOrders,
        deliveredOrders,
        totalCustomers,
        totalSales,
        profit,
        dailyOrders
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Orders",
      value: analyticsData.totalOrders,
      description: `${analyticsData.deliveredOrders} delivered`,
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Total Customers",
      value: analyticsData.totalCustomers,
      description: "Registered customers",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Total Sales",
      value: `₹${analyticsData.totalSales.toLocaleString()}`,
      description: `Last ${dateRange} days`,
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Estimated Profit",
      value: `₹${analyticsData.profit.toLocaleString()}`,
      description: "30% margin",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Daily Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
          <CardDescription>Orders and sales over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.dailyOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.dailyOrders.slice(-7).map((day, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="font-medium text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </div>
                    <div className="mt-2">
                      <div className="text-lg font-bold">{day.orders} orders</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{day.sales.toLocaleString()} sales
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Delivered Orders</span>
                <span className="font-medium">
                  {analyticsData.totalOrders > 0 
                    ? Math.round((analyticsData.deliveredOrders / analyticsData.totalOrders) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Orders</span>
                <span className="font-medium">
                  {analyticsData.totalOrders > 0 
                    ? Math.round(((analyticsData.totalOrders - analyticsData.deliveredOrders) / analyticsData.totalOrders) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Order Value</span>
                <span className="font-medium">
                  ₹{analyticsData.totalOrders > 0 
                    ? Math.round(analyticsData.totalSales / analyticsData.totalOrders).toLocaleString()
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Orders per Customer</span>
                <span className="font-medium">
                  {analyticsData.totalCustomers > 0 
                    ? (analyticsData.totalOrders / analyticsData.totalCustomers).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;