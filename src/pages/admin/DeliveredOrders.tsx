import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface Order {
  id: string;
  customer_id: string | null;
  status: string;
  payment_type: string;
  payment_status: string;
  city: string | null;
  admin_notes: string | null;
  whatsapp_sent: boolean;
  delivered_at: string | null;
  final_amount: number;
  created_at: string;
  customers?: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  order_items?: Array<{
    product_id: string;
    products: {
      name: string;
    };
  }>;
}

const DeliveredOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (name, email, phone),
          order_items (product_id, products (name))
        `)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

      if (error) throw error;
      setOrders(data as any || []);
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch delivered orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const sendWhatsAppMessage = async (orders: Order[]) => {
    try {
      for (const order of orders) {
        if (!order.customers?.phone) continue;

        const productNames = order.order_items?.map(item => item.products.name).join(', ') || 'Your order';
        const message = `Hi ${order.customers.name},\n\nYour order #${order.id.slice(0, 8)} has been *DELIVERED*!\n\nProducts: ${productNames}\nOrder Status: Delivered\n\nThank you for choosing BMS Store! We hope you love your purchase.\n\nPlease share your feedback!`;

        const whatsappUrl = `https://wa.me/${order.customers.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Mark as sent
        await supabase
          .from('orders')
          .update({ whatsapp_sent: true })
          .eq('id', order.id);
      }

      toast({
        title: "Success",
        description: `WhatsApp messages sent to ${orders.length} customer(s)`,
      });

      fetchDeliveredOrders();
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp messages",
        variant: "destructive",
      });
    }
  };

  const sendBulkWhatsApp = () => {
    const ordersToSend = orders.filter(o => selectedOrders.includes(o.id));
    sendWhatsAppMessage(ordersToSend);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold">Delivered Orders</h1>
        </div>
        {selectedOrders.length > 0 && (
          <Button onClick={sendBulkWhatsApp}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send WhatsApp to Selected ({selectedOrders.length})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivered Orders</CardTitle>
          <CardDescription>Send delivery confirmation to customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onCheckedChange={(checked) =>
                      setSelectedOrders(checked ? orders.map(o => o.id) : [])
                    }
                  />
                </TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">#{order.id.slice(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{order.customers?.name || 'Unknown'}</TableCell>
                  <TableCell>{order.customers?.phone || 'N/A'}</TableCell>
                  <TableCell>₹{order.final_amount}</TableCell>
                  <TableCell>
                    {order.delivered_at
                      ? new Date(order.delivered_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.whatsapp_sent ? (
                      <Badge variant="default">Sent</Badge>
                    ) : (
                      <Badge variant="secondary">Not Sent</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendWhatsAppMessage([order])}
                      disabled={!order.customers?.phone}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
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

export default DeliveredOrders;
