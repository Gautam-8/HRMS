import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GoalPriority, goalsService } from '@/services/goals.service';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash } from 'lucide-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSuccess?: () => void;
}

interface QuantitativeMetric {
  target: number;
  unit: string;
}

interface QualitativeMetric {
  criteria: string;
}

export function CreateGoalModal({ isOpen, onClose, employeeId, onSuccess }: CreateGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: GoalPriority.MEDIUM,
    weightage: 0,
    quantitativeMetrics: [{ target: 0, unit: '' }],
    qualitativeMetrics: [{ criteria: '' }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await goalsService.create({
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        employeeId,
        priority: formData.priority,
        weightage: formData.weightage,
        quantitativeMetrics: formData.quantitativeMetrics,
        qualitativeMetrics: formData.qualitativeMetrics,
      });

      toast({
        title: 'Success',
        description: 'Goal created successfully.',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create goal.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuantitativeMetric = () => {
    setFormData({
      ...formData,
      quantitativeMetrics: [...formData.quantitativeMetrics, { target: 0, unit: '' }],
    });
  };

  const removeQuantitativeMetric = (index: number) => {
    setFormData({
      ...formData,
      quantitativeMetrics: formData.quantitativeMetrics.filter((_, i) => i !== index),
    });
  };

  const updateQuantitativeMetric = (index: number, field: keyof QuantitativeMetric, value: string | number) => {
    const newMetrics = [...formData.quantitativeMetrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setFormData({ ...formData, quantitativeMetrics: newMetrics });
  };

  const addQualitativeMetric = () => {
    setFormData({
      ...formData,
      qualitativeMetrics: [...formData.qualitativeMetrics, { criteria: '' }],
    });
  };

  const removeQualitativeMetric = (index: number) => {
    setFormData({
      ...formData,
      qualitativeMetrics: formData.qualitativeMetrics.filter((_, i) => i !== index),
    });
  };

  const updateQualitativeMetric = (index: number, criteria: string) => {
    const newMetrics = [...formData.qualitativeMetrics];
    newMetrics[index] = { criteria };
    setFormData({ ...formData, qualitativeMetrics: newMetrics });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: GoalPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GoalPriority.LOW}>Low</SelectItem>
                  <SelectItem value={GoalPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={GoalPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightage">Weightage (%)</Label>
              <Input
                id="weightage"
                type="number"
                min="0"
                max="100"
                value={formData.weightage}
                onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Quantitative Metrics</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuantitativeMetric}>
                <Plus className="h-4 w-4" />
                Add Metric
              </Button>
            </div>
            <div className="space-y-4">
              {formData.quantitativeMetrics.map((metric, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Target</Label>
                    <Input
                      type="number"
                      value={metric.target}
                      onChange={(e) => updateQuantitativeMetric(index, 'target', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Unit</Label>
                    <Input
                      value={metric.unit}
                      onChange={(e) => updateQuantitativeMetric(index, 'unit', e.target.value)}
                      placeholder="e.g., sales, users"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuantitativeMetric(index)}
                    disabled={formData.quantitativeMetrics.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Qualitative Metrics</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQualitativeMetric}>
                <Plus className="h-4 w-4" />
                Add Metric
              </Button>
            </div>
            <div className="space-y-4">
              {formData.qualitativeMetrics.map((metric, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Criteria</Label>
                    <Input
                      value={metric.criteria}
                      onChange={(e) => updateQualitativeMetric(index, e.target.value)}
                      placeholder="e.g., Improve team collaboration"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQualitativeMetric(index)}
                    disabled={formData.qualitativeMetrics.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 