// src/pages/AdminCategories.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Select from "react-select";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    image_url: "",
    parent_id: "",
    sort_order: 0,
    product_ids: [] as string[],
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name").order("name"),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load admin data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", image_url: "", parent_id: "", sort_order: 0, product_ids: [] });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    // fetch mapped products for this category via categories_products join (if exists)
    setFormData({
      name: cat.name,
      description: cat.description || "",
      image_url: cat.image_url || "",
      parent_id: cat.parent_id || "",
      sort_order: cat.sort_order || 0,
      product_ids: [], // will be populated from categories_products table
    });
    // fetch mapped products
    fetchCategoryProducts(cat.id);
    setIsDialogOpen(true);
  };

  const fetchCategoryProducts = async (categoryId: string) => {
    try {
      const { data } = await supabase.from("categories_products").select("product_id").eq("category_id", categoryId);
      const ids = (data || []).map((r: any) => r.product_id);
      setFormData((f: any) => ({ ...f, product_ids: ids }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        image_url: formData.image_url || null,
        parent_id: formData.parent_id || null,
        sort_order: Number(formData.sort_order || 0),
      };

      if (editingCategory) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingCategory.id);
        if (error) throw error;
        toast({ title: "Success", description: "Category updated" });
        // update product mappings
        await upsertCategoryProducts(editingCategory.id, formData.product_ids || []);
      } else {
        const { data, error } = await supabase.from("categories").insert([payload]).select().single();
        if (error) throw error;
        toast({ title: "Success", description: "Category created" });
        await upsertCategoryProducts(data.id, formData.product_ids || []);
      }
      setIsDialogOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    }
  };

  const upsertCategoryProducts = async (categoryId: string, productIds: string[]) => {
    try {
      // delete existing mappings
      await supabase.from("categories_products").delete().eq("category_id", categoryId);
      // insert new mappings
      if (productIds && productIds.length) {
        const rows = productIds.map((pid: string) => ({ category_id: categoryId, product_id: pid }));
        const { error } = await supabase.from("categories_products").insert(rows);
        if (error) throw error;
      }
    } catch (err) {
      console.error("upsertCategoryProducts error:", err);
      throw err;
    }
  };

  const toggleCategoryStatus = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("categories").update({ is_active: !current }).eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Category status updated" });
      fetchAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Category deleted" });
      fetchAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories (Admin)</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
              <DialogDescription>{editingCategory ? "Update category" : "Create new category"}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
              </div>
              <div>
                <Label>Parent Category</Label>
                <select value={formData.parent_id || ""} onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || "" })} className="w-full border p-2 rounded">
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
              </div>

              <div>
                <Label>Map Products (multi)</Label>
                <Select
                  isMulti
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                  value={(formData.product_ids || []).map((id: string) => {
                    const p = products.find((x) => x.id === id);
                    return p ? { value: p.id, label: p.name } : null;
                  }).filter(Boolean)}
                  onChange={(selected: any) => setFormData({ ...formData, product_ids: (selected || []).map((s: any) => s.value) })}
                />
              </div>

              <Button type="submit" className="w-full">{editingCategory ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Manage categories and product mapping</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">No Categories</h2>
              <p className="text-gray-500">Create your first category</p>
              <Button onClick={openCreateDialog} className="mt-4">Add Category</Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded border bg-white">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.description}</div>
                    <div className="text-xs text-muted-foreground">Created: {c.created_at ? new Date(c.created_at).toLocaleString() : "-"}</div>
                    <div className="text-xs text-muted-foreground">Updated: {c.updated_at ? new Date(c.updated_at).toLocaleString() : "-"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(c)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleCategoryStatus(c.id, !!c.is_active)}>
                      {c.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCategory(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
