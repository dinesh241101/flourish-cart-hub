import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Grid3X3, Heart, ShoppingCart, Share2, PlusCircle, Filter } from 'lucide-react';
import Header from '@/components/Header';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  mrp: number;
  sale_price: number;
  images: string[];
  stock_quantity: number;
  categories?: { name: string };
}

const Categories = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    if (categoryId) {
      fetchCategoryProducts(categoryId);
    }
  }, [categoryId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false }); // default sorting DESC

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryProducts = async (catId: string) => {
    try {
      setIsLoading(true);

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', catId)
        .single();

      if (categoryError) throw categoryError;
      setSelectedCategory(categoryData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('category_id', catId)
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    console.log('Adding to cart:', productId);
  };

  const toggleWishlist = (productId: string) => {
    console.log('Toggle wishlist:', productId);
  };

  const shareProduct = (productId: string, productName: string) => {
    if (navigator.share) {
      navigator.share({
        title: productName,
        text: `Check out this amazing fashion item: ${productName}`,
        url: `${window.location.origin}/product/${productId}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${productId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header with Add + Filter */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Shop by Category</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button
              onClick={() => navigate('/admin/add-category')}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Category View */}
        {selectedCategory ? (
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-4">
              <Link to="/categories">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  All Categories
                </Button>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-2xl font-bold">{selectedCategory.name}</h1>
            </div>

            {/* Category Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                {selectedCategory.image_url && (
                  <img
                    src={selectedCategory.image_url}
                    alt={selectedCategory.name}
                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">{selectedCategory.name}</h2>
                  <p className="text-muted-foreground mb-4">{selectedCategory.description}</p>
                  <Badge variant="secondary">{products.length} products available</Badge>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.mrp > product.sale_price && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {Math.round(((product.mrp - product.sale_price) / product.mrp) * 100)}% OFF
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-lg">₹{product.sale_price}</span>
                      {product.mrp > product.sale_price && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
                      )}
                    </div>

                    <Button
                      className="w-full gap-2"
                      size="sm"
                      onClick={() => addToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground">This category doesn't have any products yet.</p>
              </div>
            )}
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="relative">
                    <img
                      src={category.image_url || '/placeholder.svg'}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
