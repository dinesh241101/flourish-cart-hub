
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  code: string;
  actualPrice: number;
  sellingPrice: number;
  image: string;
  category: string;
  inStock: boolean;
  isNew?: boolean;
  discount?: number;
  onClick: () => void;
}

const ProductCard = ({ 
  id, 
  name, 
  code, 
  actualPrice, 
  sellingPrice, 
  image, 
  category, 
  inStock, 
  isNew, 
  discount,
  onClick 
}: ProductCardProps) => {
  const discountPercentage = discount || Math.round(((actualPrice - sellingPrice) / actualPrice) * 100);

  return (
    <Card className="product-card group cursor-pointer overflow-hidden">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={onClick}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <Badge className="bg-success text-success-foreground">NEW</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-discount text-white">{discountPercentage}% OFF</Badge>
          )}
          {!inStock && (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={onClick}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Add to Cart */}
        {inStock && (
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button className="w-full btn-accent" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      <div className="p-4" onClick={onClick}>
        <div className="mb-2">
          <p className="text-xs text-muted-foreground mb-1">{category}</p>
          <h3 className="font-semibold text-primary line-clamp-2 mb-1">{name}</h3>
          <p className="text-xs text-muted-foreground">Code: {code}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="price-text text-lg">₹{sellingPrice.toLocaleString()}</span>
            {actualPrice > sellingPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{actualPrice.toLocaleString()}
              </span>
            )}
          </div>
          {inStock ? (
            <span className="text-xs text-success font-medium">In Stock</span>
          ) : (
            <span className="text-xs text-destructive font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
