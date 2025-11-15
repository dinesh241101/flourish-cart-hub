import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle } from 'lucide-react';

interface Complaint {
  id: string;
  customer_id: string;
  product_id: string;
  complaint_text: string;
  image_urls: string[];
  status: string;
  created_at: string;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaints',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Complaint status updated'
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to update complaint',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'default',
      'in-progress': 'secondary',
      resolved: 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Complaints</h1>
        <Badge variant="outline">{complaints.length} Total</Badge>
      </div>

      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Complaint #{complaint.id.slice(0, 8)}</CardTitle>
                {getStatusBadge(complaint.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(complaint.created_at).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description:</h4>
                  <p className="text-sm text-muted-foreground">{complaint.complaint_text}</p>
                </div>

                {complaint.image_urls && complaint.image_urls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attached Images:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {complaint.image_urls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Complaint ${idx + 1}`}
                          className="h-20 w-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {complaint.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Mark In Progress
                    </Button>
                  )}
                  {complaint.status !== 'resolved' && (
                    <Button
                      size="sm"
                      onClick={() => updateComplaintStatus(complaint.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {complaints.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No complaints registered yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Complaints;