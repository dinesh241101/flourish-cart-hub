
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
              Discover Amazing
              <span className="text-accent block">Products</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Explore our curated collection of premium products, designed to enhance your lifestyle with quality and style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-accent text-lg px-8 py-3 group">
                <ShoppingBag className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-3">
                View Categories
              </Button>
            </div>
          </div>
          
          <div className="relative animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-accent/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent">1000+</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="bg-success/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success">4.9★</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="bg-accent/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
