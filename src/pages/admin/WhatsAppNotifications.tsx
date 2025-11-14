import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  whatsapp_number: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
}

interface Offer {
  id: string;
  offer_name: string;
  title: string;
}

const WhatsAppNotifications = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [contentType, setContentType] = useState<'product' | 'offer' | 'custom'>('custom');
  const [selectedContent, setSelectedContent] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes, offersRes] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('products').select('id, name, code'),
        supabase.from('offers').select('id, offer_name, title')
      ]);

      if (customersRes.data) setCustomers(customersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (offersRes.data) setOffers(offersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const generateMessage = () => {
    if (contentType === 'product' && selectedContent) {
      const product = products.find(p => p.id === selectedContent);
      if (product) {
        return `🛍️ Check out our new product: ${product.name} (${product.code})!\n\nVisit BMS Store to shop now!`;
      }
    } else if (contentType === 'offer' && selectedContent) {
      const offer = offers.find(o => o.id === selectedContent);
      if (offer) {
        return `🎉 Special Offer: ${offer.title || offer.offer_name}!\n\nDon't miss out! Shop at BMS Store today!`;
      }
    }
    return message;
  };

  const sendNotifications = async () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one customer',
        variant: 'destructive'
      });
      return;
    }

    const finalMessage = generateMessage();
    if (!finalMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const selectedCustomerData = customers.filter(c => selectedCustomers.includes(c.id));
      
      // In a real implementation, this would call a WhatsApp API
      // For now, we'll simulate the sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log the notification attempt
      for (const customer of selectedCustomerData) {
        await supabase.from('analytics').insert({
          event_type: 'whatsapp_notification',
          event_data: {
            customer_id: customer.id,
            customer_name: customer.name,
            phone: customer.whatsapp_number,
            message: finalMessage,
            content_type: contentType,
            content_id: selectedContent
          }
        });
      }

      toast({
        title: 'Success',
        description: `WhatsApp messages sent to ${selectedCustomers.length} customer(s)`
      });

      setSelectedCustomers([]);
      setMessage('');
      setSelectedContent('');
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notifications',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">WhatsApp Notifications</h1>
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={selectAllCustomers}
              className="w-full"
            >
              {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
            </Button>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                  <Checkbox
                    id={customer.id}
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => toggleCustomer(customer.id)}
                  />
                  <label
                    htmlFor={customer.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.whatsapp_number}</div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Message</SelectItem>
                  <SelectItem value="product">Product Promotion</SelectItem>
                  <SelectItem value="offer">Offer Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contentType === 'product' && (
              <div>
                <Label>Select Product</Label>
                <Select value={selectedContent} onValueChange={setSelectedContent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {contentType === 'offer' && (
              <div>
                <Label>Select Offer</Label>
                <Select value={selectedContent} onValueChange={setSelectedContent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {offers.map(offer => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.title || offer.offer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {contentType === 'custom' && (
              <div>
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your custom message..."
                  rows={6}
                />
              </div>
            )}

            <div className="p-4 bg-muted rounded">
              <Label className="text-sm font-medium">Message Preview:</Label>
              <p className="text-sm mt-2 whitespace-pre-wrap">{generateMessage() || 'Your message will appear here...'}</p>
            </div>

            <Button
              onClick={sendNotifications}
              disabled={sending || selectedCustomers.length === 0}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to {selectedCustomers.length} Customer(s)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppNotifications;