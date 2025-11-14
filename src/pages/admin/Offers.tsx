
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, Percent } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  offer_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  start_date: string;
  end_date: string;
  usage_limit?: number | null;
  used_count?: number;
  is_active: boolean;
  created_at: string;
}

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offer_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: '',
    start_date: '',
    end_date: '',
    usage_limit: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers((data || []).map(offer => ({
        ...offer,
        offer_type: offer.offer_type as 'percentage' | 'fixed_amount',
        used_count: 0,
        max_discount_amount: null,
        usage_limit: null
      })));
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const offerData = {
        ...formData,
        offer_name: formData.title, // Required field
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount),
        max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null
      };

      if (editingOffer) {
        const { error } = await supabase
          .from('offers')
          .update(offerData as any)
          .eq('id', editingOffer.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('offers')
          .insert([offerData as any]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Offer created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        offer_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        max_discount_amount: '',
        start_date: '',
        end_date: '',
        usage_limit: ''
      });
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        title: "Error",
        description: "Failed to save offer",
        variant: "destructive",
      });
    }
  };

  const toggleOfferStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive",
      });
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
      
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      offer_type: offer.offer_type,
      discount_value: offer.discount_value,
      min_order_amount: offer.min_order_amount,
      max_discount_amount: offer.max_discount_amount?.toString() || '',
      start_date: offer.start_date.split('T')[0],
      end_date: offer.end_date.split('T')[0],
      usage_limit: offer.usage_limit?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      offer_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_discount_amount: '',
      start_date: '',
      end_date: '',
      usage_limit: ''
    });
    setIsDialogOpen(true);
  };

  const isOfferActive = (offer: Offer) => {
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);
    return offer.is_active && now >= startDate && now <= endDate;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Offers</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Percent className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Offers & Discounts</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'Edit Offer' : 'Create Offer'}
              </DialogTitle>
              <DialogDescription>
                {editingOffer ? 'Update offer information' : 'Create a new promotional offer'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Offer Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your offer..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offer_type">Discount Type</Label>
                  <Select value={formData.offer_type} onValueChange={(value: 'percentage' | 'fixed_amount') => setFormData({ ...formData, offer_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discount_value">
                    Discount Value {formData.offer_type === 'percentage' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_order_amount">Min Order Amount (₹)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_discount_amount">Max Discount Amount (₹)</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    step="0.01"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
          <CardDescription>Manage your promotional offers and discounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{offer.title}</div>
                      {offer.description && (
                        <div className="text-sm text-muted-foreground">{offer.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {offer.offer_type === 'percentage' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Min: ₹{offer.min_order_amount}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(offer.start_date).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">to {new Date(offer.end_date).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{offer.used_count} used</div>
                      {offer.usage_limit && (
                        <div className="text-muted-foreground">of {offer.usage_limit}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isOfferActive(offer) ? 'default' : 'secondary'}>
                      {isOfferActive(offer) ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(offer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                    >
                      {offer.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteOffer(offer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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

export default Offers;
