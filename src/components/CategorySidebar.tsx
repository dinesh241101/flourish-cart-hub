
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  productCount: number;
  subcategories?: Category[];
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategory?: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategorySidebar = ({ categories, activeCategory, onCategorySelect }: CategorySidebarProps) => {
  return (
    <Card className="p-4 h-fit sticky top-24">
      <h3 className="font-semibold text-primary mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => onCategorySelect(category.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors duration-200 ${
                activeCategory === category.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <span className="font-medium">{category.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {category.productCount}
                </Badge>
                {category.subcategories && category.subcategories.length > 0 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </button>
            
            {category.subcategories && activeCategory === category.id && (
              <div className="ml-4 mt-2 space-y-1">
                {category.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => onCategorySelect(subcategory.id)}
                    className="w-full flex items-center justify-between p-2 rounded text-sm text-left hover:bg-muted transition-colors duration-200"
                  >
                    <span>{subcategory.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {subcategory.productCount}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CategorySidebar;
