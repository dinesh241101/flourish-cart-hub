import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { time } from "console";

interface ProcessedOrder {
  id: string;
  customer_id: string;
  status: string;
  payment_type: string;
  city: string;
  final_amount: number;
  processed_at: string;
  created_at: string;
  customers?: {
    name: string;
    phone: string;
    address: string;
  };
}

const ProcessedOrders = () => {
  const [orders, setOrders] = useState<ProcessedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProcessedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    paymentType: "all",
    city: [] as string[],
    minAmount: "",
    maxAmount: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProcessedOrders();
  }, []);

  const fetchProcessedOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          customers (name, phone, address)
        `
        )
        .eq("status", "accepted")
        .not("processed_at", "is", null);

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (filters.paymentType !== "all") {
      filtered = filtered.filter(
        (order) => order.payment_type === filters.paymentType
      );
    }

    if (filters.city.length > 0) {
      filtered = filtered.filter((order) =>
        filters.city.includes(order.city)
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(
        (order) => order.final_amount >= Number(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(
        (order) => order.final_amount <= Number(filters.maxAmount)
      );
    }

    setFilteredOrders(filtered);
  };

  const resetFilters = () => {
    setFilters({
      paymentType: "all",
      city: [],
      minAmount: "",
      maxAmount: "",
    });
    setFilteredOrders(orders);
  };

  const generateExcel = () => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "Payment Type",
      "Final Amount",
      "Processed At",
    ];

    const rows = filteredOrders.map((order) => [
      order.id,
      order.customers?.name || "",
      order.customers?.phone || "",
      order.customers?.address || "",
      order.city,
      order.payment_type,
      order.final_amount,
      order.processed_at,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "processed_orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUniqueValues = (key: keyof ProcessedOrder) => {
    return Array.from(new Set(orders.map((order) => order[key] as string))).filter(
      Boolean
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">Processed Orders</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter orders by payment type, city, or amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Payment Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Payment Type
              </label>
              <Select
                value={filters.paymentType}
                onValueChange={(value) =>
                  setFilters({ ...filters, paymentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {getUniqueValues("payment_type").map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters({ ...filters, city: [] });
                  } else {
                    const newCities = filters.city.includes(value)
                      ? filters.city.filter((c) => c !== value)
                      : [...filters.city, value];
                    setFilters({ ...filters, city: newCities });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      filters.city.length > 0
                        ? filters.city.join(", ")
                        : "Select Cities"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {getUniqueValues("city").map((city) => (
                    <SelectItem key={city} value={city}>
                      {city} {filters.city.includes(city) ? "✔️" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Min Amount
              </label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters({ ...filters, minAmount: e.target.value })
                }
                className="w-full border rounded p-2"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Max Amount
              </label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters({ ...filters, maxAmount: e.target.value })
                }
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2 justify-end">
            <Button onClick={applyFilters}>Search</Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button variant="outline" onClick={fetchProcessedOrders}>
              Refresh
            </Button>
            <Button onClick={generateExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customers?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customers?.phone}
                    </div>
                  </TableCell>
                  <TableCell>{order.city}</TableCell>
                  <TableCell>{order.payment_type}</TableCell>
                  <TableCell>₹{order.final_amount}</TableCell>
                  <TableCell>
                    <Badge>{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.processed_at).toLocaleString()}
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

export default ProcessedOrders;
