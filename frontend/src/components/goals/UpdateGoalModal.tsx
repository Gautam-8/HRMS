import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Goal, goalsService } from '@/services/goals.service';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface UpdateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onSuccess?: () => void;
}

export function UpdateGoalModal({ isOpen, onClose, goal, onSuccess }: UpdateGoalModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState(goal.metrics || {
    quantitative: [],
    qualitative: []
  });
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Update metrics if changed
      if (JSON.stringify(metrics) !== JSON.stringify(goal.metrics)) {
        await goalsService.updateMetrics(goal.id, metrics, goal.employee.id);
      }

      // Update feedback if provided
      if (feedback) {
        await goalsService.submitFeedback(
          goal.id,
          feedback,
          undefined, // rating is optional
          user?.role === 'Manager',
          user?.id || ''
        );
      }

      toast({
        title: 'Success',
        description: 'Goal updated successfully.',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuantitativeMetric = () => {
    setMetrics({
      ...metrics,
      quantitative: [...metrics.quantitative, { target: 0, achieved: 0, unit: '' }],
    });
  };

  const removeQuantitativeMetric = (index: number) => {
    setMetrics({
      ...metrics,
      quantitative: metrics.quantitative.filter((_, i) => i !== index),
    });
  };

  const updateQuantitativeMetric = (index: number, field: keyof typeof metrics.quantitative[0], value: number | string) => {
    const newMetrics = { ...metrics };
    newMetrics.quantitative[index] = {
      ...newMetrics.quantitative[index],
      [field]: value,
    };
    setMetrics(newMetrics);
  };

  const addQualitativeMetric = () => {
    setMetrics({
      ...metrics,
      qualitative: [...metrics.qualitative, { criteria: '', rating: 0, comments: '' }],
    });
  };

  const removeQualitativeMetric = (index: number) => {
    setMetrics({
      ...metrics,
      qualitative: metrics.qualitative.filter((_, i) => i !== index),
    });
  };

  const updateQualitativeMetric = (index: number, field: keyof typeof metrics.qualitative[0], value: string | number) => {
    const newMetrics = { ...metrics };
    newMetrics.qualitative[index] = {
      ...newMetrics.qualitative[index],
      [field]: value,
    };
    setMetrics(newMetrics);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Goal: {goal.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quantitative Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Quantitative Metrics</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuantitativeMetric}>
                <Plus className="h-4 w-4" />
                Add Metric
              </Button>
            </div>
            <div className="space-y-4">
              {metrics.quantitative.map((metric, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <Label>Target</Label>
                    <Input
                      type="number"
                      value={metric.target}
                      onChange={(e) => updateQuantitativeMetric(index, 'target', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Achieved</Label>
                    <Input
                      type="number"
                      value={metric.achieved}
                      onChange={(e) => updateQuantitativeMetric(index, 'achieved', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Unit</Label>
                      <Input
                        value={metric.unit}
                        onChange={(e) => updateQuantitativeMetric(index, 'unit', e.target.value)}
                        placeholder="e.g., tasks"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuantitativeMetric(index)}
                      disabled={metrics.quantitative.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Qualitative Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Qualitative Metrics</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQualitativeMetric}>
                <Plus className="h-4 w-4" />
                Add Metric
              </Button>
            </div>
            <div className="space-y-4">
              {metrics.qualitative.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label>Criteria</Label>
                      <Input
                        value={metric.criteria}
                        onChange={(e) => updateQualitativeMetric(index, 'criteria', e.target.value)}
                        placeholder="e.g., Code Quality"
                        required
                      />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={metric.rating}
                        onChange={(e) => updateQualitativeMetric(index, 'rating', Number(e.target.value))}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQualitativeMetric(index)}
                      disabled={metrics.qualitative.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      value={metric.comments}
                      onChange={(e) => updateQualitativeMetric(index, 'comments', e.target.value)}
                      placeholder="Add comments..."
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          {(user?.role === 'Manager' || goal.employee.id === user?.id) && (
            <div className="space-y-2">
              <Label>{user?.role === 'Manager' ? 'Manager Feedback' : 'Self Assessment'}</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={user?.role === 'Manager' ? 'Provide feedback...' : 'Add self assessment...'}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 