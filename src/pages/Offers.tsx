import React from 'react';
import { useOffers } from '@/hooks/useHomeConfig';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Sparkles, Calendar, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface Offer {
  id: string;
  title: string;
  description: string;
  offer_type: string;
  discount_value: number;
  coupon_code: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const Offers = () => {
  const { data: offersData, isLoading } = useOffers();
  const offers = (offersData || []) as Offer[];
  const { toast } = useToast();

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: `Coupon code "${code}" copied to clipboard`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold">Active Offers</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Grab these amazing deals before they expire!
          </p>
        </motion.div>

        {/* Offers Grid */}
        {offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 border-b">
                    <Badge className="mb-3">
                      {offer.offer_type === 'percentage'
                        ? `${offer.discount_value}% OFF`
                        : `₹${offer.discount_value} OFF`}
                    </Badge>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {offer.description}
                    </p>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    {/* Coupon Code */}
                    {offer.coupon_code && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag className="h-4 w-4" />
                          <span>Coupon Code</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted px-4 py-3 rounded-lg font-mono text-lg font-bold text-center">
                            {offer.coupon_code}
                          </div>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyCoupon(offer.coupon_code!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Validity Period */}
                    {offer.start_date && offer.end_date && (
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-muted-foreground">Valid Period</p>
                          <p className="font-medium">
                            {formatDate(offer.start_date)} - {formatDate(offer.end_date)}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button className="w-full" onClick={() => window.location.href = '/cart'}>
                      Apply to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Offers</h3>
              <p className="text-muted-foreground">
                Check back later for exciting deals and discounts!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Offers;