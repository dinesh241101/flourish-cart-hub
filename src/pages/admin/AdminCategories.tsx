import { createClient } from "@supabase/supabase-js";



import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching categories", description: error.message });
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Save or update category
  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Category name is required" });
      return;
    }

    let result;
    if (editingId) {
      result = await supabase
        .from("categories")
        .update({
          name,
          description,
          parent_id: parentId || null,
          updated_at: new Date(),
        })
        .eq("id", editingId);
    } else {
      result = await supabase.from("categories").insert([
        {
          name,
          description,
          parent_id: parentId || null,
        },
      ]);
    }

    if (result.error) {
      toast({ title: "Error saving category", description: result.error.message });
    } else {
      toast({ title: "Category saved successfully" });
      resetForm();
      fetchCategories();
    }
  };

  // Edit
  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setParentId(cat.parent_id || null);
  };

  // Delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting category", description: error.message });
    } else {
      toast({ title: "Category deleted" });
      fetchCategories();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setParentId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Categories</h1>

      {/* Category form */}
      <div className="mb-6 space-y-2">
        <Input
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value || null)}
          className="border p-2 rounded w-full"
        >
          <option value="">No Parent (Main Category)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            {editingId ? "Update" : "Add"} Category
          </Button>
          {editingId && <Button variant="secondary" onClick={resetForm}>Cancel</Button>}
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex justify-between items-center border p-3 rounded shadow-sm hover:shadow-md transition"
          >
            <div>
              <p className="font-semibold">{cat.name}</p>
              <p className="text-sm text-gray-600">{cat.description}</p>
              {cat.parent_id && (
                <p className="text-xs text-gray-500">
                  Parent: {categories.find((c) => c.id === cat.parent_id)?.name || "—"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleEdit(cat)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
