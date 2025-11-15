import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface HeroSlide {
  id: string;
  slide_order: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  isNew?: boolean;
}

const HeroConfig = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_config')
        .select('*')
        .order('slide_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
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

  const addSlide = () => {
    const newSlide: any = {
      id: crypto.randomUUID(),
      slide_order: slides.length,
      title: 'New Slide',
      subtitle: '',
      description: '',
      image_url: '',
      cta_text: 'Shop Now',
      cta_link: '/categories',
      is_active: true,
      isNew: true,
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlide = (id: string, field: string, value: any) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const deleteSlide = async (id: string, isNew: boolean) => {
    if (!isNew) {
      try {
        const { error } = await supabase
          .from('hero_config')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
    }
    setSlides(slides.filter(slide => slide.id !== id));
  };

  const saveSlides = async () => {
    try {
      setLoading(true);
      
      // Separate new and existing slides
      const newSlides = slides.filter((s: any) => s.isNew);
      const existingSlides = slides.filter((s: any) => !s.isNew);

      // Insert new slides
      if (newSlides.length > 0) {
        const { error: insertError } = await supabase
          .from('hero_config')
          .insert(newSlides.map(({ isNew, ...slide }) => slide));

        if (insertError) throw insertError;
      }

      // Update existing slides
      for (const slide of existingSlides) {
        const { error: updateError } = await supabase
          .from('hero_config')
          .update({
            slide_order: slide.slide_order,
            title: slide.title,
            subtitle: slide.subtitle,
            description: slide.description,
            image_url: slide.image_url,
            cta_text: slide.cta_text,
            cta_link: slide.cta_link,
            is_active: slide.is_active,
          })
          .eq('id', slide.id);

        if (updateError) throw updateError;
      }

      toast({
        title: 'Success',
        description: 'Hero slides saved successfully!',
      });

      fetchSlides(); // Refresh
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

  if (loading && slides.length === 0) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Hero Section Configuration</h1>
        <Button onClick={addSlide} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Slide
        </Button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                Slide {index + 1}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={slide.is_active}
                  onCheckedChange={(checked) => updateSlide(slide.id, 'is_active', checked)}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteSlide(slide.id, (slide as any).isNew)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                    placeholder="e.g., New Collection"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={slide.subtitle || ''}
                    onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                    placeholder="e.g., Summer 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={slide.description || ''}
                  onChange={(e) => updateSlide(slide.id, 'description', e.target.value)}
                  placeholder="Engaging description for the slide"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={slide.image_url || ''}
                    onChange={(e) => updateSlide(slide.id, 'image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input
                    value={slide.cta_link || ''}
                    onChange={(e) => updateSlide(slide.id, 'cta_link', e.target.value)}
                    placeholder="/categories"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input
                  value={slide.cta_text || ''}
                  onChange={(e) => updateSlide(slide.id, 'cta_text', e.target.value)}
                  placeholder="Shop Now"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slides.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No hero slides yet. Click "Add Slide" to create one.</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={saveSlides} disabled={loading} className="w-full md:w-auto">
        {loading ? 'Saving...' : 'Save All Changes'}
      </Button>
    </div>
  );
};

export default HeroConfig;