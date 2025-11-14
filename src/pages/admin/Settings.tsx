
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, Palette, Globe, Mail, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WebsiteConfig {
  key: string;
  value: string;
  description: string | null;
}

const Settings = () => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const defaultConfig = {
    site_name: 'BMS Fashion Store',
    site_description: 'Your premier destination for trendy fashion and lifestyle products',
    contact_email: 'support@bmsfashion.com',
    contact_phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India',
    whatsapp_number: '+91 98765 43210',
    instagram_handle: '@bmsfashion',
    facebook_page: 'bmsfashion',
    enable_notifications: 'true',
    enable_whatsapp_orders: 'true',
    currency_symbol: '₹',
    shipping_charge: '99',
    free_shipping_threshold: '999',
    return_policy_days: '7',
    about_us: 'BMS Fashion Store is your one-stop destination for the latest fashion trends and lifestyle products.'
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('website_config')
        .select('*');

      if (error) throw error;

      const configMap: Record<string, string> = {};
      data?.forEach((item: any) => {
        configMap[item.key] = item.value;
      });

      // Merge with defaults for any missing keys
      setConfig({ ...defaultConfig, ...configMap });
    } catch (error) {
      console.error('Error fetching config:', error);
      setConfig(defaultConfig);
      toast({
        title: "Info",
        description: "Using default configuration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upsert all config values
      const configItems = Object.entries(config).map(([key, value]) => ({
        key,
        value,
        description: getConfigDescription(key)
      }));

      const { error } = await supabase
        .from('website_config')
        .upsert(configItems, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getConfigDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      site_name: 'The name of your website',
      site_description: 'A brief description of your website',
      contact_email: 'Primary contact email address',
      contact_phone: 'Primary contact phone number',
      address: 'Business address',
      whatsapp_number: 'WhatsApp contact number',
      instagram_handle: 'Instagram handle without @',
      facebook_page: 'Facebook page name',
      enable_notifications: 'Enable push notifications',
      enable_whatsapp_orders: 'Enable WhatsApp order functionality',
      currency_symbol: 'Currency symbol to display',
      shipping_charge: 'Default shipping charge',
      free_shipping_threshold: 'Minimum order amount for free shipping',
      return_policy_days: 'Number of days for returns',
      about_us: 'About us content'
    };
    return descriptions[key] || '';
  };

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
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
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic website configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={config.site_name || ''}
                  onChange={(e) => updateConfig('site_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={config.site_description || ''}
                  onChange={(e) => updateConfig('site_description', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="about_us">About Us</Label>
                <Textarea
                  id="about_us"
                  value={config.about_us || ''}
                  onChange={(e) => updateConfig('about_us', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Contact details and social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={config.contact_email || ''}
                    onChange={(e) => updateConfig('contact_email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={config.contact_phone || ''}
                    onChange={(e) => updateConfig('contact_phone', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={config.address || ''}
                  onChange={(e) => updateConfig('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={config.whatsapp_number || ''}
                    onChange={(e) => updateConfig('whatsapp_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_handle">Instagram Handle</Label>
                  <Input
                    id="instagram_handle"
                    value={config.instagram_handle || ''}
                    onChange={(e) => updateConfig('instagram_handle', e.target.value)}
                    placeholder="bmsfashion"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ecommerce" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>E-commerce Settings</CardTitle>
              <CardDescription>Shopping and order configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency_symbol">Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={config.currency_symbol || ''}
                    onChange={(e) => updateConfig('currency_symbol', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_charge">Shipping Charge</Label>
                  <Input
                    id="shipping_charge"
                    type="number"
                    value={config.shipping_charge || ''}
                    onChange={(e) => updateConfig('shipping_charge', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="free_shipping_threshold">Free Shipping Above</Label>
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    value={config.free_shipping_threshold || ''}
                    onChange={(e) => updateConfig('free_shipping_threshold', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="return_policy_days">Return Policy (Days)</Label>
                <Input
                  id="return_policy_days"
                  type="number"
                  value={config.return_policy_days || ''}
                  onChange={(e) => updateConfig('return_policy_days', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable WhatsApp Orders</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to place orders via WhatsApp</p>
                </div>
                <Switch
                  checked={config.enable_whatsapp_orders === 'true'}
                  onCheckedChange={(checked) => updateConfig('enable_whatsapp_orders', checked.toString())}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize your website appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notifications to users</p>
                </div>
                <Switch
                  checked={config.enable_notifications === 'true'}
                  onCheckedChange={(checked) => updateConfig('enable_notifications', checked.toString())}
                />
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  More appearance customization options will be available in future updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
