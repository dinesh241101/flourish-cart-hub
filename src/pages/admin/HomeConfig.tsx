import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const HomeConfig = () => {
  const [config, setConfig] = useState({
    showCategories: true,
    showOffers: true,
    showTrending: true,
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Success',
      description: 'Configuration saved!',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Home Page Configuration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Categories</Label>
            <Switch checked={config.showCategories} onCheckedChange={(checked) => setConfig({...config, showCategories: checked})} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Offers</Label>
            <Switch checked={config.showOffers} onCheckedChange={(checked) => setConfig({...config, showOffers: checked})} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Trending</Label>
            <Switch checked={config.showTrending} onCheckedChange={(checked) => setConfig({...config, showTrending: checked})} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">Save Configuration</Button>
    </div>
  );
};

export default HomeConfig;