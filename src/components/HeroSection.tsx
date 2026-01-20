import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroSlides } from '@/hooks/useHomeConfig';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: heroSlides, isLoading } = useHeroSlides();
  const navigate = useNavigate();

  // Default slides if none in database
  const defaultSlides = [
    {
      id: '1',
      title: "New Collection",
      subtitle: "Summer 2024",
      description: "Discover our latest fashion trends and exclusive designs",
      image_url: "",
      cta_text: "Shop Collection",
      cta_link: "/categories",
      slide_order: 0,
    },
  ];

  const slides = (heroSlides && heroSlides.length > 0) ? heroSlides : defaultSlides;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return (
      <section className="relative h-[400px] md:h-[600px] overflow-hidden bg-muted animate-pulse" />
    );
  }

  return (
    <section className="relative h-[400px] md:h-[600px] overflow-hidden">
      {/* Hero Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: slide.image_url ? `url(${slide.image_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Content */}
              <div className="relative container mx-auto px-4 h-full flex items-center">
                <div className="max-w-lg text-white animate-fade-in">
                  {slide.subtitle && (
                    <p className="text-accent text-base md:text-lg mb-2 font-medium">{slide.subtitle}</p>
                  )}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  {slide.description && (
                    <p className="text-base md:text-xl mb-6 md:mb-8 text-gray-200">
                      {slide.description}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground text-base md:text-lg px-6 md:px-8 py-2 md:py-3 group"
                      onClick={() => navigate(slide.cta_link || '/categories')}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
                      {slide.cta_text || 'Shop Now'}
                      <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
