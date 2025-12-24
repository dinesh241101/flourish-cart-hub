
import React from 'react';
import { ShoppingCart, Search, User, Menu, Home, Grid3X3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary text-primary-foreground rounded-lg p-2 font-bold text-xl">
              BMS
            </div>
            <h1 className="text-xl font-bold text-primary hidden sm:block">Fashion</h1>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>


            <Link 
              to="/categories" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/categories') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Categories</span>
            </Link>


            <Link 
              to="/trending" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/trending') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Trending</span>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search fashion items..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">

            <Link to = "/login">

            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="h-5 w-5" />
              <span className="ml-2 hidden lg:inline">Account</span>



            </Button>
            </Link>


            <Link to="/login">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="ml-2 hidden lg:inline">Cart</span>
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t pt-2 pb-3">
          <nav className="flex justify-center space-x-6">
            <Link 
              to="/" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/') ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Link>
            <Link 
              to="/categories" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/categories') ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
              <span className="text-xs">Categories</span>
            </Link>
            <Link 
              to="/trending" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/trending') ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Trending</span>
            </Link>
            <Link 
              to="/cart" 
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors relative ${
                isActive('/cart') ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Cart</span>
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
          </nav>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search fashion items..."
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
