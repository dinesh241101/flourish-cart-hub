
import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  sale_price: number;
  mrp: number;
  image_url?: string;
  stock_quantity: number;
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
          code={product.id}
          actualPrice={product.mrp}
          sellingPrice={product.sale_price}
          image={product.image_url || "/placeholder.svg"}
          category=""
          inStock={product.stock_quantity > 0}
          isNew={false}
          onClick={() => handleProductClick(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
