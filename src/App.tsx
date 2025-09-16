import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Offers from "./pages/admin/Offers";
import Settings from "./pages/admin/Settings";
import Analytics from "./pages/admin/Analytics";
import ProcessedOrders from "./pages/admin/ProcessedOrders";
import NotFound from "./pages/NotFound";
import AdminNotFound from "./pages/admin/AdminNotFound";
import Inventory from './pages/admin/Inventory';
import Trending from './pages/Trending';
import TrendingProducts from './pages/admin/TrendingProducts';
import AddProduct from './pages/admin/AddProduct';
import CreateOffer from './pages/admin/CreateOffer';
import AddCategory from './pages/admin/AddCategory';
import ProductForm from './pages/admin/ProductForm';
import CategoriesLanding from "@/pages/CategoriesLanding";
import CategoryProducts from "@/pages/CategoryProducts";
import ProductPage from './pages/ProductPage';
import CategoryLanding from '@/pages/CategoriesLanding';
// import CategoryPage from './pages/CategoryPage';
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
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/categories" element={<CategoriesLanding />} />
                <Route path="/category/:id" element={<CategoryProducts />} />
                <Route path='/product/:id' element={<ProductPage />} />
                <Route path="/category" element={<CategoriesLanding />} />
                {/* <Route path="/category/:id" element={<CategoryPage />} /> */}
                <Route path="/all-categories" element={<CategoriesLanding />} /> 
                {/* <Route path="/category" element={<CategoryLanding />} /> */}
                
                
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
                  <Route path="/admin/categories" element={<AdminCategories />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
                <Route path="/admin/*" element={<AdminNotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
