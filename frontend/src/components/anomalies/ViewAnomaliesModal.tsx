import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { anomaliesService } from '@/services/anomalies.service';
import { AnomalyType, AnomalySeverity, AnomalyStatus, Anomaly } from '@/types/anomalies';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface ViewAnomaliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: AnomalyType;
}

const severityColors: Record<AnomalySeverity, string> = {
  [AnomalySeverity.LOW]: 'bg-yellow-100 text-yellow-800',
  [AnomalySeverity.MEDIUM]: 'bg-orange-100 text-orange-800',
  [AnomalySeverity.HIGH]: 'bg-red-100 text-red-800',
};

const statusColors: Record<AnomalyStatus, string> = {
  [AnomalyStatus.DETECTED]: 'bg-blue-100 text-blue-800',
  [AnomalyStatus.REVIEWING]: 'bg-purple-100 text-purple-800',
  [AnomalyStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [AnomalyStatus.FALSE_POSITIVE]: 'bg-gray-100 text-gray-800',
};

export function ViewAnomaliesModal({ isOpen, onClose, type }: ViewAnomaliesModalProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchAnomalies();
    }
  }, [isOpen, type, user?.id]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const response = await anomaliesService.getAnomalies({ type, userId: user?.id });
      setAnomalies(response.data);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch anomalies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDetectAnomalies = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'Please select a specific user to detect anomalies',
        variant: 'destructive',
      });
      return;
    }

    try {
      setDetecting(true);
      await anomaliesService.detectAnomalies(user?.id);
      toast({
        title: 'Success',
        description: 'Anomaly detection completed',
      });
      fetchAnomalies();
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      toast({
        title: 'Error',
        description: 'Failed to detect anomalies',
        variant: 'destructive',
      });
    } finally {
      setDetecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {type ? `${type} Anomalies` : 'All Anomalies'}
              {user?.id && ' for User'}
            </DialogTitle>
            <Button 
              onClick={handleDetectAnomalies} 
              disabled={detecting || !user?.id}
              variant="outline"
              className="flex items-center gap-2"
            >
              {detecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Detect Anomalies
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : anomalies.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No anomalies found
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{anomaly.type}</Badge>
                      <Badge className={severityColors[anomaly.severity]}>
                        {anomaly.severity}
                      </Badge>
                      <Badge className={statusColors[anomaly.status]}>
                        {anomaly.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(anomaly.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-sm">{anomaly.description}</p>

                  {anomaly.details?.metrics && (
                    <div className="text-sm">
                      <strong>Metrics:</strong>
                      <ul className="list-disc list-inside">
                        {Object.entries(anomaly.details.metrics).map(([key, value]) => (
                          <li key={key}>
                            {key}: {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {anomaly.details?.recommendations && (
                    <div className="text-sm">
                      <strong>Recommendations:</strong>
                      <ul className="list-disc list-inside">
                        {anomaly.details.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 