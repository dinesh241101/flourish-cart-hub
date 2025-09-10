import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
}

const AddCategory: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([""]); // dynamic subcategories

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("id, name");
    if (error) console.error("Error fetching products", error);
    else setProducts(data || []);
  };

  const handleFileUpload = async () => {
    if (!file) return "";
    try {
      const filePath = `categories/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("categories") // bucket name
        .upload(filePath, file);

      if (error) throw error;

      const publicUrl = supabase.storage
        .from("categories")
        .getPublicUrl(filePath).data.publicUrl;

      setImageUrl(publicUrl);
      return publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload Failed",
        description: "Could not upload file. Check bucket name.",
        variant: "destructive",
      });
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedUrl = imageUrl;
    if (file) {
      uploadedUrl = await handleFileUpload();
    }

    const { error } = await supabase.from("categories").insert([
      {
        name,
        description,
        image_url: uploadedUrl,
        is_active: isActive,
        sort_order: 0,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category created successfully!",
      });
      setName("");
      setDescription("");
      setFile(null);
      setImageUrl("");
      setSelectedProducts([]);
      setSubcategories([""]); // reset form
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <Label>Category Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isActive}
                onCheckedChange={(val) => setIsActive(!!val)}
              />
              <Label>Active</Label>
            </div>

            {/* File Upload */}
            <div>
              <Label>Category Image / JSON / GIF</Label>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {imageUrl && (
                <img src={imageUrl} alt="Uploaded" className="mt-2 h-32 rounded" />
              )}
            </div>

            {/* Products */}
            <div>
              <Label>Select Products</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedProducts.includes(p.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedProducts([...selectedProducts, p.id]);
                        else setSelectedProducts(selectedProducts.filter((id) => id !== p.id));
                      }}
                    />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            <div>
              <Label>Subcategories</Label>
              {subcategories.map((sub, idx) => (
                <div key={idx} className="flex space-x-2 mb-2">
                  <Input
                    value={sub}
                    onChange={(e) => {
                      const updated = [...subcategories];
                      updated[idx] = e.target.value;
                      setSubcategories(updated);
                    }}
                    placeholder="Subcategory name"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setSubcategories(subcategories.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => setSubcategories([...subcategories, ""])}
              >
                + Add Subcategory
              </Button>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full">
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCategory;
