import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface ProductFormProps {
  productId?: string; // for edit mode
}

const AddProductForm: React.FC<ProductFormProps> = ({ productId }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [mrp, setMrp] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);

  // arrays stored as jsonb
  const [features, setFeatures] = useState<string[]>([]);
  const [similarProducts, setSimilarProducts] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  // Fetch existing product if editing
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data) {
        setName(data.name || "");
        setCode(data.code || "");
        setDescription(data.description || "");
        setMrp(data.mrp || 0);
        setSalePrice(data.sale_price || 0);
        setFeatures(data.features || []);
        setSimilarProducts(data.similar_products || []);
        setImageUrls(data.image_url ? [data.image_url] : []);
        setVideoUrls(data.videos || []);
        setImages(data.images || []);
        setVideos(data.videos || []);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSave = async () => {
    const payload = {
      name,
      code,
      description,
      mrp,
      sale_price: salePrice,
      features,
      similar_products: similarProducts,
      image_url: imageUrls[0] || "",
      video_urls: videoUrls,
      images,
      videos,
      is_active: true,
    };

    let response;
    if (productId) {
      response = await supabase.from("products").update(payload).eq("id", productId);
    } else {
      response = await supabase.from("products").insert([payload]);
    }

    if (response.error) {
      toast({ title: "Error", description: response.error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product saved successfully!" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">{productId ? "Edit Product" : "Add Product"}</h1>

      <div className="space-y-4">
        <div>
          <Label>Product Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label>Product Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>MRP</Label>
            <Input
              type="number"
              value={mrp}
              onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Sale Price</Label>
            <Input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <Label>Features (one per line)</Label>
          <Textarea
            value={features.join("\n")}
            onChange={(e) =>
              setFeatures(
                e.target.value.split("\n").map((line) => line.trim()).filter(Boolean)
              )
            }
          />
        </div>

        {/* Similar Products */}
        <div>
          <Label>Similar Products (IDs, one per line)</Label>
          <Textarea
            value={similarProducts.join("\n")}
            onChange={(e) =>
              setSimilarProducts(
                e.target.value.split("\n").map((line) => line.trim()).filter(Boolean)
              )
            }
          />
        </div>

        {/* Image URL */}
        <div>
          <Label>Image URL</Label>
          <Input
            value={imageUrls[0] || ""}
            onChange={(e) => setImageUrls([e.target.value.trim()])}
          />
        </div>

        {/* Video URLs */}
        <div>
          <Label>Video URLs (one per line)</Label>
          <Textarea
            value={videoUrls.join("\n")}
            onChange={(e) =>
              setVideoUrls(
                e.target.value.split("\n").map((line) => line.trim()).filter(Boolean)
              )
            }
          />
        </div>

        {/* Images JSONB */}
        <div>
          <Label>Images JSON (array)</Label>
          <Textarea
            value={JSON.stringify(images, null, 2)}
            onChange={(e) => {
              try {
                setImages(JSON.parse(e.target.value));
              } catch {
                // ignore invalid JSON
              }
            }}
          />
        </div>

        {/* Videos JSONB */}
        <div>
          <Label>Videos JSON (array)</Label>
          <Textarea
            value={JSON.stringify(videos, null, 2)}
            onChange={(e) => {
              try {
                setVideos(JSON.parse(e.target.value));
              } catch {
                // ignore invalid JSON
              }
            }}
          />
        </div>

        <Button className="w-full mt-4" onClick={handleSave}>
          {productId ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </div>
  );
};

export default AddProductForm;
