import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    fetchDashboardStats();

    // Auto refresh only the top stats every 30s
    const interval = setInterval(() => {
      fetchDashboardStats(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async (triggerFlash: boolean = false) => {
    try {
      const [productsResult, ordersResult, customersResult, revenueResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase.from('orders').select('final_amount')
      ]);

      const totalRevenue =
        revenueResult.data?.reduce((sum, order) => sum + Number(order.final_amount), 0) || 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalCustomers: customersResult.count || 0,
        totalRevenue: totalRevenue
      });

      setLastUpdated(new Date());

      if (triggerFlash) {
        setFlash(true);
        setTimeout(() => setFlash(false), 800); // flash duration
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      description: 'Active products in store',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      description: 'Orders received',
      icon: ShoppingCart,
      color: 'text-green-600'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      description: 'Registered customers',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      description: 'Revenue generated',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to BMS Store Admin Panel</p>
      </div>

      {/* Auto-refreshing Top Stats */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className={`transition-all duration-500 ${
                  flash ? 'bg-yellow-50 shadow-lg' : 'hover:shadow-lg'
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <CardDescription className="text-xs text-gray-500">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Last updated timestamp */}
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-2 text-right">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Rest of dashboard (static, no auto refresh) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent orders to display</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/add-product">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/create-offer">
                <TrendingUp className="mr-2 h-4 w-4" />
                Create Offer
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/add-category">
                <Package className="mr-2 h-4 w-4" />
                Add New Category
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href="/admin/add-inventory">
                <Package className="mr-2 h-4 w-4" />
                Add Inventory
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
