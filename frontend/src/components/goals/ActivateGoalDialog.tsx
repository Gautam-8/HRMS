import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Goal, goalsService } from '@/services/goals.service';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ActivateGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onSuccess?: () => void;
}

export function ActivateGoalDialog({ isOpen, onClose, goal, onSuccess }: ActivateGoalDialogProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();

  const handleActivate = async () => {
    if (!feedback.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide initial feedback before activating the goal.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await goalsService.activateGoal(goal.id, feedback);
      onSuccess?.();
      onClose();
      toast({
        title: 'Success',
        description: 'Goal activated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate goal.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate Goal</DialogTitle>
          <DialogDescription>
            Are you sure you want to activate this goal? Once activated, the employee will be able to start working on it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Initial Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide initial feedback or expectations for this goal..."
              className="min-h-[100px]"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleActivate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate Goal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 