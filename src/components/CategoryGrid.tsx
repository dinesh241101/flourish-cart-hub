
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryGridProps {
  categories: Array<{
    id: string;
    name: string;
    image_url?: string;
    description?: string;
  }>;
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Card key={category.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <span className="text-2xl font-bold text-primary">{category.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
