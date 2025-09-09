import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  mrp: number;
}

const CreateOffer = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<any>({
    title: "",
    offer_type: "product",
    discount_type: "percentage",
    discount_value: "",
    product_ids: [],
    cart_product_ids: [],
    applicable_count: "",
    offer_count: "",
    min_cart_items: "",
    min_cart_amount: "",
    start_date: null,
    end_date: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // auto-generate title
    let title = `${formData.offer_type.toUpperCase()} OFFER - ${formData.discount_value}${formData.discount_type === "percentage" ? "%" : "₹"} OFF`;
    setFormData((prev: any) => ({ ...prev, title }));
  }, [formData.offer_type, formData.discount_type, formData.discount_value]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, mrp")
      .order("name");

    if (!error && data) setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.discount_type === "percentage" && Number(formData.discount_value) > 100) {
      toast({
        title: "Validation Error",
        description: "Percentage discount cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    if (formData.start_date && formData.end_date) {
      if (formData.end_date < formData.start_date) {
        toast({
          title: "Validation Error",
          description: "End date cannot be earlier than start date",
          variant: "destructive",
        });
        return;
      }
    }

    const payload = {
      ...formData,
      start_date: formData.start_date
        ? formData.start_date.toISOString().split("T")[0]
        : null,
      end_date: formData.end_date
        ? formData.end_date.toISOString().split("T")[0]
        : null,
    };

    const { error } = await supabase.from("offers").insert([payload]);

    if (error) {
      console.error("Error creating offer:", error);
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Offer created successfully!",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-24 p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🎁 Create New Offer</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Title */}
        <div className="col-span-2">
          <Label>Offer Title</Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Offer Type */}
        <div>
          <Label>Offer Type</Label>
          <select
            value={formData.offer_type}
            onChange={(e) =>
              setFormData({ ...formData, offer_type: e.target.value })
            }
            className="w-full border p-2 rounded-md"
          >
            <option value="product">Product Offer</option>
            <option value="cart">Cart Offer</option>
          </select>
        </div>

        {/* Discount Type */}
        <div>
          <Label>Discount Type</Label>
          <select
            value={formData.discount_type}
            onChange={(e) =>
              setFormData({ ...formData, discount_type: e.target.value })
            }
            className="w-full border p-2 rounded-md"
          >
            <option value="percentage">Percentage</option>
            <option value="amount">Fixed Amount</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <Label>Discount Value</Label>
          <Input
            type="number"
            value={formData.discount_value}
            onChange={(e) =>
              setFormData({ ...formData, discount_value: e.target.value })
            }
            required
          />
        </div>

        {/* Product Selection */}
        {formData.offer_type === "product" && (
          <div className="col-span-2">
            <Label>Select Products</Label>
            <Select
              isMulti
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (₹${p.mrp})`,
              }))}
              value={products
                .filter((p) => formData.product_ids.includes(p.id))
                .map((p) => ({ value: p.id, label: p.name }))}
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  product_ids: selected.map((s: any) => s.value),
                })
              }
            />
          </div>
        )}

        {/* Cart Offer Fields */}
        {formData.offer_type === "cart" && (
          <>
            <div className="col-span-2">
              <Label>Select Eligible Cart Products</Label>
              <Select
                isMulti
                options={products.map((p) => ({
                  value: p.id,
                  label: `${p.name} (₹${p.mrp})`,
                }))}
                value={products
                  .filter((p) => formData.cart_product_ids.includes(p.id))
                  .map((p) => ({ value: p.id, label: p.name }))}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    cart_product_ids: selected.map((s: any) => s.value),
                  })
                }
              />
            </div>

            <div>
              <Label>Minimum Cart Items</Label>
              <Input
                type="number"
                value={formData.min_cart_items}
                onChange={(e) =>
                  setFormData({ ...formData, min_cart_items: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Minimum Cart Amount</Label>
              <Input
                type="number"
                value={formData.min_cart_amount}
                onChange={(e) =>
                  setFormData({ ...formData, min_cart_amount: e.target.value })
                }
              />
            </div>
          </>
        )}

        {/* Limits */}
        <div>
          <Label>Applicable Count (per customer)</Label>
          <Input
            type="number"
            value={formData.applicable_count}
            onChange={(e) =>
              setFormData({ ...formData, applicable_count: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Total Offer Count</Label>
          <Input
            type="number"
            value={formData.offer_count}
            onChange={(e) =>
              setFormData({ ...formData, offer_count: e.target.value })
            }
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 col-span-2">
          {/* Start */}
          <div>
            <Label>Offer Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date
                    ? format(formData.start_date, "PPP")
                    : "Pick a Offer start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.start_date}
                  onSelect={(date) =>
                    setFormData({ ...formData, start_date: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* End */}
          <div>
            <Label>Offer End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.end_date
                    ? format(formData.end_date, "PPP")
                    : "Pick an Offer end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.end_date}
                  onSelect={(date) =>
                    setFormData({ ...formData, end_date: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Submit */}
        <div className="col-span-2 flex justify-end">
          <Button type="submit" className="px-6 py-2">
            Save Offer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOffer;
