import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TrendingProduct {
  id: string;
  product_id: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  products?: {
    name: string;
    code: string;
    sale_price: number;
    image_url: string | null;
  };
}

interface Product {
  id: string;
  name: string;
  code: string;
  sale_price: number;
}

const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    sort_order: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendingProducts();
    fetchAvailableProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("trending_products")
        .select(`
          *,
          products (name, code, sale_price, image_url)
        `)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setTrendingProducts(data as any || []);
    } catch (error) {
      console.error("Error fetching trending products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch trending products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, code, sale_price")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("trending_products")
        .insert([{
          product_id: formData.product_id,
          sort_order: Number(formData.sort_order),
          is_active: true,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added to trending successfully",
      });

      setIsDialogOpen(false);
      setFormData({ product_id: "", sort_order: 0 });
      fetchTrendingProducts();
    } catch (error) {
      console.error("Error adding trending product:", error);
      toast({
        title: "Error",
        description: "Failed to add trending product",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("trending_products")
        .update({ status: !currentStatus ? 'active' : 'inactive' } as any)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });

      fetchTrendingProducts();
    } catch (error) {
      console.error("Error updating product status:", error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trending_products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product removed from trending",
      });

      fetchTrendingProducts();
    } catch (error) {
      console.error("Error deleting trending product:", error);
      toast({
        title: "Error",
        description: "Failed to remove product from trending",
        variant: "destructive",
      });
    }
  };

  const updateSortOrder = async (id: string, direction: "up" | "down") => {
    const currentItem = trendingProducts.find(item => item.id === id);
    if (!currentItem) return;

    const newSortOrder = direction === "up" 
      ? Math.max(0, currentItem.sort_order - 1)
      : currentItem.sort_order + 1;

    try {
      const { error } = await supabase
        .from("trending_products")
        .update({ sort_order: newSortOrder })
        .eq("id", id);

      if (error) throw error;

      fetchTrendingProducts();
    } catch (error) {
      console.error("Error updating sort order:", error);
      toast({
        title: "Error",
        description: "Failed to update sort order",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Trending Products</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Trending Products</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Trending Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Trending Product</DialogTitle>
              <DialogDescription>
                Select a product to add to the trending section
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product_id">Product</Label>
                <select
                  id="product_id"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full p-2 border border-input rounded-md bg-background"
                  required
                >
                  <option value="">Select Product</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  placeholder="0 for first position"
                />
              </div>
              <Button type="submit" className="w-full">
                Add to Trending
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trending Products Management</CardTitle>
          <CardDescription>
            Configure which products appear in the trending section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendingProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{item.sort_order}</span>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateSortOrder(item.id, "up")}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateSortOrder(item.id, "down")}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.products?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.products?.code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>₹{item.products?.sale_price}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProductStatus(item.id, item.is_active)}
                      >
                        {item.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProduct(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingProducts;