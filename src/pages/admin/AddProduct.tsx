// src/pages/AdminProducts.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Select from "react-select";

interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
}

interface Product {
  id: string;
  name: string;
  code?: string;
  mrp?: number;
  sale_price?: number;
  images?: string[] | null;
  category_id?: string | null;
  subcategory_id?: string | null;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [{ data: prodData }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("sort_order", { ascending: false }),
      ]);
      setProducts(prodData || []);
      setCategories(cats || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      code: p.code,
      mrp: p.mrp,
      sale_price: p.sale_price,
      category_id: p.category_id || "",
      subcategory_id: p.subcategory_id || "",
    });
  };

  const save = async () => {
    try {
      if (!editing) return;
      const payload: any = {
        name: form.name,
        code: form.code || null,
        mrp: Number(form.mrp || 0),
        sale_price: Number(form.sale_price || 0),
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
      };
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) throw error;
      toast({ title: "Success", description: "Product updated" });
      setEditing(null);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products (Admin)</h1>
      </div>

      <div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded border">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Code: {p.code}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => openEdit(p)}>Edit</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">Edit Product</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border p-2 rounded">
                  <option value="">Select category</option>
                  {categories.filter(c => !c.parent_id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <select value={form.subcategory_id} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })} className="w-full border p-2 rounded">
                  <option value="">Select subcategory</option>
                  {categories.filter(c => c.parent_id === form.category_id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={save}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
