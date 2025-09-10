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
}

interface Product {
  id: string;
  name: string;
}

const AddProduct = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    code: "",
    mrp: "",
    sale_price: "",
    category_id: "",
    type: "physical",
    cloth_type: "",
    description: "",
    features: "",
    image_urls: [] as string[],
    video_urls: [] as string[],
    similar_products: [] as string[],
  });

  // Fetch categories and products
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (!error && data) setCategories(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .order("name");
    if (!error && data) setProducts(data);
  };

  // Handle file uploads
  const handleUpload = async (
    files: FileList,
    bucket: "product-images" | "product-videos",
    type: "image_urls" | "video_urls"
  ) => {
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`products/${Date.now()}-${file.name}`, file);

      if (error) {
        console.error("Upload failed:", error);
        toast({
          title: "Error",
          description: "File upload failed",
          variant: "destructive",
        });
        continue;
      }

      const publicUrl = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path).data.publicUrl;

      uploadedUrls.push(publicUrl);
    }

    setFormData((prev: any) => ({
      ...prev,
      [type]: [...prev[type], ...uploadedUrls],
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Normalize array fields before insert
    const cleanedData = {
      ...formData,
      category_id: formData.category_id || null,
      similar_products: Array.isArray(formData.similar_products)
        ? formData.similar_products
        : formData.similar_products
        ? [formData.similar_products]
        : [],
      image_urls: Array.isArray(formData.image_urls)
        ? formData.image_urls
        : formData.image_urls
        ? [formData.image_urls]
        : [],
      video_urls: Array.isArray(formData.video_urls)
        ? formData.video_urls
        : formData.video_urls
        ? [formData.video_urls]
        : [],
    };

    const { error } = await supabase.from("products").insert([cleanedData]);

    if (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Product added successfully!" });
      setFormData({
        name: "",
        code: "",
        mrp: "",
        sale_price: "",
        category_id: "",
        type: "physical",
        cloth_type: "",
        description: "",
        features: "",
        image_urls: [],
        video_urls: [],
        similar_products: [],
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-16 bg-white rounded-xl shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">➕ Add New Product</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Product Name */}
        <div>
          <Label>Product Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* SKU Code */}
        <div>
          <Label>SKU Code</Label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>

        {/* MRP */}
        <div>
          <Label>MRP</Label>
          <Input
            type="number"
            value={formData.mrp}
            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
            required
          />
        </div>

        {/* Sale Price */}
        <div>
          <Label>Sale Price</Label>
          <Input
            type="number"
            value={formData.sale_price}
            onChange={(e) =>
              setFormData({ ...formData, sale_price: e.target.value })
            }
            required
          />
        </div>

        {/* Category */}
        <div>
          <Label>Category</Label>
          <select
            value={formData.category_id}
            onChange={(e) =>
              setFormData({ ...formData, category_id: e.target.value })
            }
            className="w-full border p-2 rounded-md"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <Label>Type</Label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="w-full border p-2 rounded-md"
          >
            <option value=""></option>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="service">Service</option>
          </select>
        </div>

        {/* Cloth Type */}
        <div>
          <Label>Cloth Type</Label>
          <Input
            value={formData.cloth_type}
            onChange={(e) =>
              setFormData({ ...formData, cloth_type: e.target.value })
            }
          />
        </div>

        {/* Features */}
        <div className="col-span-2">
          <Label>Features</Label>
          <Textarea
            value={formData.features}
            onChange={(e) =>
              setFormData({ ...formData, features: e.target.value })
            }
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Similar Products */}
        <div className="col-span-2">
          <Label>Similar Products</Label>
          <Select
            isMulti
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            value={products
              .filter((p) => formData.similar_products.includes(p.id))
              .map((p) => ({ value: p.id, label: p.name }))}
            onChange={(selected) =>
              setFormData({
                ...formData,
                similar_products: selected.map((s: any) => s.value),
              })
            }
          />
        </div>

        {/* Image Upload */}
        <div className="col-span-2">
          <Label>Upload Images</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              e.target.files &&
              handleUpload(e.target.files, "product-images", "image_urls")
            }
          />
          <div className="flex gap-3 mt-3 flex-wrap">
            {formData.image_urls.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                alt="preview"
                className="h-20 w-20 rounded-lg border object-cover shadow"
              />
            ))}
          </div>
        </div>

        {/* Video Upload */}
        <div className="col-span-2">
          <Label>Upload Videos</Label>
          <Input
            type="file"
            accept="video/*"
            multiple
            onChange={(e) =>
              e.target.files &&
              handleUpload(e.target.files, "product-videos", "video_urls")
            }
          />
          <div className="flex gap-3 mt-3 flex-wrap">
            {formData.video_urls.map((url: string, i: number) => (
              <video
                key={i}
                src={url}
                controls
                className="h-28 rounded-lg border shadow"
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-end">
          <Button type="submit" className="px-6 py-2" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
