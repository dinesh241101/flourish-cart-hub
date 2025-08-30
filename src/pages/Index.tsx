
import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Truck, Star, Heart, Award } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fashion-focused categories
  const categories = [
    {
      id: 'women-fashion',
      name: 'Women\'s Fashion',
      description: 'Trendy dresses, tops, and accessories for modern women',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
      productCount: 245
    },
    {
      id: 'men-fashion',
      name: 'Men\'s Fashion', 
      description: 'Stylish shirts, pants, and accessories for men',
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&h=400&fit=crop',
      productCount: 189
    },
    {
      id: 'accessories',
      name: 'Accessories',
      description: 'Bags, jewelry, watches, and fashion accessories',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop',
      productCount: 167
    },
    {
      id: 'footwear',
      name: 'Footwear',
      description: 'Comfortable and stylish shoes for every occasion',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      productCount: 134
    }
  ];

  // Fashion products
  const featuredProducts = [
    {
      id: '1',
      name: 'Elegant Summer Dress',
      code: 'BMS-WD001',
      actualPrice: 2999,
      sellingPrice: 2299,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
      category: 'Women\'s Fashion',
      inStock: true,
      isNew: true
    },
    {
      id: '2',
      name: 'Classic Denim Jacket',
      code: 'BMS-DJ002',
      actualPrice: 3499,
      sellingPrice: 2799,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      category: 'Men\'s Fashion',
      inStock: true
    },
    {
      id: '3',
      name: 'Designer Handbag',
      code: 'BMS-HB003',
      actualPrice: 4999,
      sellingPrice: 3999,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
      category: 'Accessories',
      inStock: true
    },
    {
      id: '4',
      name: 'Casual Sneakers',
      code: 'BMS-SN004',
      actualPrice: 2499,
      sellingPrice: 1999,
      image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
      category: 'Footwear',
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
              Discover our curated collection of fashion categories, each designed to help you express your unique style.
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
              Explore All Collections
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
              Trending Now
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay ahead of fashion trends with our handpicked selection of the most popular and stylish pieces.
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
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground group">
              Shop All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Fashion Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-fade-in">
              <div className="bg-pink-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Curated Collections</h3>
              <p className="text-muted-foreground">
                Handpicked fashion pieces by our style experts to keep you looking trendy and elegant.
              </p>
            </div>
            
            <div className="text-center p-6 animate-fade-in">
              <div className="bg-purple-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                Only the finest materials and craftsmanship go into every piece in our collection.
              </p>
            </div>
            
            <div className="text-center p-6 animate-fade-in">
              <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Customer Satisfaction</h3>
              <p className="text-muted-foreground">
                4.9/5 rating from thousands of happy customers who love our fashion and service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Stay Fashion Forward
            </h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and fashion tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8">
                Subscribe
              </Button>
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
                <h3 className="text-xl font-bold">Fashion</h3>
              </div>
              <p className="text-primary-foreground/80">
                Your premier destination for trendy fashion and lifestyle products that elevate your style.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-accent transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Sale</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Returns</a></li>
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
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-primary-foreground/80">
                <p>📧 hello@bmsfashion.com</p>
                <p>📞 +91 98765 43210</p>
                <p>📍 Mumbai, Maharashtra</p>
                <p>🕒 Mon-Sat: 10AM-8PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 BMS Fashion Store. All rights reserved. | Follow the latest trends with us!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
