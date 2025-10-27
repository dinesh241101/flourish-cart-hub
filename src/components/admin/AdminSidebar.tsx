
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  Percent, 
  Settings,
  FolderTree,
  TrendingUp,
  FolderCheck
} from 'lucide-react';
import CategoryCard from '../CategoryCard';
import path from 'path';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
    {path: '/admin/add-category', icon: FolderCheck, label: 'Add Category' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    {path: '/admin/add-product', icon: Package, label: 'Add Product' },
    { path: '/admin/inventory', icon: Package, label: 'Inventory' },
    { path: '/admin/trending', icon: TrendingUp, label: 'Trending' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/processed-orders', icon: Tags, label: 'Processed Orders' },
    {path: '/admin/shipped-orders', icon: ShoppingCart, label: 'Shipped Orders' },
    {path: '/admin/delivered-orders', icon: ShoppingCart, label: 'Delivered Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/offers', icon: Percent, label: 'Offers' },
    {path: '/admin/create-offer', icon: Percent, label: 'Create Offer' },
    { path: '/admin/analytics', icon: LayoutDashboard, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg z-30">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
