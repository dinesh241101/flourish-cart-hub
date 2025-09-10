import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/Categories";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Offers from "./pages/admin/Offers";
import Settings from "./pages/admin/Settings";
import Analytics from "./pages/admin/Analytics";
import ProcessedOrders from "./pages/admin/ProcessedOrders";
import NotFound from "./pages/NotFound";
import Inventory from './pages/admin/Inventory';
import Trending from './pages/Trending';
import TrendingProducts from './pages/admin/TrendingProducts';
import AddProduct from './pages/admin/AddProduct';
import CreateOffer from './pages/admin/CreateOffer';
import AddCategory from './pages/admin/AddCategory';
import ProductForm from './pages/admin/ProductForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:categoryId" element={<Categories />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/trending" element={<Trending />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="add-category" element={<AddCategory />} />
                  <Route path="/admin/products/add" element={<ProductForm />} />
                  <Route path="/admin/products/edit/:productId" element={<ProductForm />} />
                  <Route path="products" element={<Products />} />
                  <Route path="add-product" element={<AddProduct />} />
                  <Route path='inventory' element={<Inventory />} />
                  <Route path='trending' element={<TrendingProducts />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="processed-orders" element={<ProcessedOrders />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="create-offer" element={<CreateOffer />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
