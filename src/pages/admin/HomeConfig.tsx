import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const HomeConfig = () => {
  const [config, setConfig] = useState({
    show_categories: true,
    show_offers: true,
    show_trending: true,
  });
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('home_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfigId(data.id);
        setConfig({
          show_categories: data.show_categories ?? true,
          show_offers: data.show_offers ?? true,
          show_trending: data.show_trending ?? true,
        });
      }
    } catch (error: any) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (configId) {
        // Update existing
        const { error } = await supabase
          .from('home_config')
          .update(config)
          .eq('id', configId);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('home_config')
          .insert([config])
          .select()
          .single();

        if (error) throw error;
        setConfigId(data.id);
      }

      toast({
        title: 'Success',
        description: 'Configuration saved successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !configId) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Home Page Configuration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Categories Section</Label>
            <Switch 
              checked={config.show_categories} 
              onCheckedChange={(checked) => setConfig({...config, show_categories: checked})} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Offers Section</Label>
            <Switch 
              checked={config.show_offers} 
              onCheckedChange={(checked) => setConfig({...config, show_offers: checked})} 
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Trending Section</Label>
            <Switch 
              checked={config.show_trending} 
              onCheckedChange={(checked) => setConfig({...config, show_trending: checked})} 
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
        {loading ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  );
};

export default HomeConfig;