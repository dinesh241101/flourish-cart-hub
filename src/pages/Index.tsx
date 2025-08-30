
import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - in real app this would come from your database
  const categories = [
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Latest gadgets and tech accessories',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
      productCount: 124
    },
    {
      id: 'fashion',
      name: 'Fashion',
      description: 'Trendy clothing and accessories',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      productCount: 89
    },
    {
      id: 'home',
      name: 'Home & Living',
      description: 'Beautiful home décor and furniture',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      productCount: 156
    },
    {
      id: 'sports',
      name: 'Sports & Fitness',
      description: 'Equipment for an active lifestyle',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      productCount: 67
    }
  ];

  const featuredProducts = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      code: 'BMS-001',
      actualPrice: 5999,
      sellingPrice: 4499,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      category: 'Electronics',
      inStock: true,
      isNew: true
    },
    {
      id: '2',
      name: 'Smart Fitness Tracker',
      code: 'BMS-002',
      actualPrice: 3499,
      sellingPrice: 2799,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
      category: 'Sports & Fitness',
      inStock: true
    },
    {
      id: '3',
      name: 'Designer Coffee Mug Set',
      code: 'BMS-003',
      actualPrice: 1299,
      sellingPrice: 999,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop',
      category: 'Home & Living',
      inStock: true
    },
    {
      id: '4',
      name: 'Casual Cotton T-Shirt',
      code: 'BMS-004',
      actualPrice: 999,
      sellingPrice: 749,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      category: 'Fashion',
      inStock: false
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
  };

  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
    // Navigate to product detail page
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection />

      {/* Featured Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our wide range of products across different categories, each carefully curated for quality and value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                description={category.description}
                image={category.image}
                productCount={category.productCount}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" className="group">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Check out our most popular and trending products, loved by customers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>

          <div className="text-center">
            <Button className="btn-accent group">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-fade-in">
              <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Quick and reliable delivery to your doorstep within 24-48 hours.
              </p>
            </div>
            
            <div className="text-center p-6 animate-fade-in">
              <div className="bg-success/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Quality Assured</h3>
              <p className="text-muted-foreground">
                All products are quality checked and come with manufacturer warranty.
              </p>
            </div>
            
            <div className="text-center p-6 animate-fade-in">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Free Shipping</h3>
              <p className="text-muted-foreground">
                Enjoy free shipping on orders above ₹999 across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-accent text-accent-foreground rounded-lg p-2 font-bold text-xl">
                  BMS
                </div>
                <h3 className="text-xl font-bold">Store</h3>
              </div>
              <p className="text-primary-foreground/80">
                Your trusted partner for quality products and exceptional shopping experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Shipping Info</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                {categories.map((category) => (
                  <li key={category.id}>
                    <a href="#" className="hover:text-accent transition-colors">
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <p>📧 support@bmsstore.com</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 Mumbai, Maharashtra, India</p>
                <p>🕒 Mon-Sat: 9AM-7PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 BMS Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
