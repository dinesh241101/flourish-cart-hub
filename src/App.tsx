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
import ShippedOrders from './pages/admin/ShippedOrders';
import DeliveredOrders from './pages/admin/DeliveredOrders';
import Signup from './pages/Signup';
import HomeConfig from './pages/admin/HomeConfig';
import HeroConfig from './pages/admin/HeroConfig';
import Complaints from './pages/admin/Complaints';
import WhatsAppNotifications from './pages/admin/WhatsAppNotifications';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import Cart from './pages/Cart';
import CartPage from './pages/CartPage';
import OffersPage from './pages/Offers';
import AdminOffers from "./pages/admin/Offers";

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
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/categories" element={<CategoriesLanding />} />
                <Route path="/category/:id" element={<CategoryProducts />} />
                <Route path='/product/:productId' element={<ProductPage />} />
                <Route path="/category" element={<CategoriesLanding />} />
                <Route path="/all-categories" element={<CategoriesLanding />} /> 
                <Route path="/login" element={<AuthPage />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/offers" element={<OffersPage />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="add-category" element={<AddCategory />} />
                  <Route path="products/add" element={<ProductForm />} />
                  <Route path="products/edit/:productId" element={<ProductForm />} />
                  <Route path="products" element={<Products />} />
                  <Route path="add-product" element={<AddProduct />} />
                  <Route path='inventory' element={<Inventory />} />
                  <Route path='trending' element={<TrendingProducts />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="processed-orders" element={<ProcessedOrders />} />
                  <Route path="shipped-orders" element={<ShippedOrders />} />
                  <Route path="delivered-orders" element={<DeliveredOrders />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="offers" element={<AdminOffers />} />
                  <Route path="create-offer" element={<CreateOffer />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                <Route path="home-config" element={<HomeConfig />} />
                <Route path="hero-config" element={<HeroConfig />} />
                <Route path="complaints" element={<Complaints />} />
                  <Route path="whatsapp-notifications" element={<WhatsAppNotifications />} />
                </Route>
                
                {/* Catch all routes */}
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
