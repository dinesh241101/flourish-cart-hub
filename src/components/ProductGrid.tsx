
import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  code: string;
  selling_price: number;
  actual_price: number;
  stock_quantity: number;
  categories?: { name: string } | null;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
    // Navigate to product detail page
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          code={product.code}
          actualPrice={product.actual_price}
          sellingPrice={product.selling_price}
          image="/placeholder.svg" // You can add image field to products table
          category={product.categories?.name || 'Uncategorized'}
          inStock={product.stock_quantity > 0}
          isNew={false} // You can add this logic based on created_at
          onClick={() => handleProductClick(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
