
import React from 'react';
import { Card } from '@/components/ui/card';

interface CategoryCardProps {
  name: string;
  description: string;
  image: string;
  productCount: number;
  onClick: () => void;
}

const CategoryCard = ({ name, description, image, productCount, onClick }: CategoryCardProps) => {
  return (
    <Card 
      className="category-card group cursor-pointer overflow-hidden animate-fade-in"
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-primary mb-1">{name}</h3>
        <p className="text-muted-foreground text-sm mb-2">{description}</p>
        <p className="text-xs text-accent font-medium">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>
      </div>
    </Card>
  );
};

export default CategoryCard;
