import { useState } from 'react';
import { format } from 'date-fns';
import { Goal, GoalPriority, GoalStatus, goalsService } from '@/services/goals.service';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UpdateGoalModal } from './UpdateGoalModal';
import { ActivateGoalDialog } from './ActivateGoalDialog';
import { useAuth } from '@/hooks/use-auth';
import { Edit, Plus, Minus, Loader2 } from 'lucide-react';
import { PeerReviews } from './PeerReviews';
import { Competencies } from './Competencies';
import { useToast } from '@/components/ui/use-toast';

interface GoalCardProps {
  goal: Goal;
  onProgressUpdate?: (progress: number) => void;
  onGoalUpdate?: () => void;
}

export function GoalCard({ goal, onGoalUpdate }: GoalCardProps) {
  const { user } = useAuth();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMM yyyy');
  };

  const getPriorityColor = (priority: GoalPriority) => {
    const colors: Record<GoalPriority, string> = {
      [GoalPriority.HIGH]: 'bg-red-100 text-red-800 border-red-200',
      [GoalPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [GoalPriority.LOW]: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority];
  };

  const getStatusColor = (status: GoalStatus) => {
    const colors: Record<GoalStatus, string> = {
      [GoalStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-200',
      [GoalStatus.ACTIVE]: 'bg-blue-100 text-blue-800 border-blue-200',
      [GoalStatus.IN_REVIEW]: 'bg-purple-100 text-purple-800 border-purple-200',
      [GoalStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status];
  };

  const hasQuantitativeMetrics = goal.metrics?.quantitative && goal.metrics.quantitative.length > 0;
  const hasQualitativeMetrics = goal.metrics?.qualitative && goal.metrics.qualitative.length > 0;

  // Only managers can edit metrics and provide feedback
  const canEditGoal = user?.role === 'Manager' && goal.status !== GoalStatus.COMPLETED;
  
  // Employees can only update their own goals' progress
  const canUpdateProgress = goal.employee.id === user?.id && goal.status === GoalStatus.ACTIVE;

  const handleProgressUpdate = async (increment: boolean) => {

    const newProgress = increment 
      ? Math.min(100, goal.progress + 10)
      : Math.max(0, goal.progress - 10);

    try {
      setLoading(true);
      await goalsService.updateProgress(goal.id, newProgress, user!.id);
      toast({
        title: 'Success',
        description: 'Goal progress updated successfully.',
      });
      onGoalUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal progress.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmitForReview = async () => {
    try {
      setLoading(true);
      await goalsService.submitForReview(goal.id);
      onGoalUpdate?.();
      toast({
        title: 'Success',
        description: 'Goal submitted for review.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit goal for review.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async () => {
    try {
      setLoading(true);
      await goalsService.approveReview(goal.id);
      onGoalUpdate?.();
      toast({
        title: 'Success',
        description: 'Goal review approved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve goal review.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReview = async (feedback: string) => {
    try {
      setLoading(true);
      await goalsService.rejectReview(goal.id, feedback);
      onGoalUpdate?.();
      toast({
        title: 'Success',
        description: 'Goal review rejected.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject goal review.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-[#111827]">{goal.title}</h3>
                <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
              </div>
              <p className="text-sm text-[#6B7280]">
                {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
              {canEditGoal && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563] mb-4">{goal.description}</p>
          
          {/* Progress Section */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Progress</span>
              <span className="text-[#111827] font-medium">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
            {canUpdateProgress && (
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressUpdate(false)}
                  disabled={loading || goal.progress <= 0}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressUpdate(true)}
                  disabled={loading || goal.progress >= 100}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Metrics Section */}
          {(hasQuantitativeMetrics || hasQualitativeMetrics) && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              {/* Quantitative Metrics */}
              {hasQuantitativeMetrics && goal.metrics?.quantitative && (
                <div>
                  <h4 className="text-sm font-medium text-[#111827] mb-2">Quantitative Metrics</h4>
                  <div className="space-y-2">
                    {goal.metrics.quantitative.map((metric, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#6B7280]">{metric.unit}</span>
                          <span className="text-[#111827]">
                            {metric.achieved || 0}/{metric.target}
                          </span>
                        </div>
                        <Progress
                          value={(metric.achieved / metric.target) * 100}
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualitative Metrics */}
              {hasQualitativeMetrics && goal.metrics?.qualitative && (
                <div>
                  <h4 className="text-sm font-medium text-[#111827] mb-2">Qualitative Metrics</h4>
                  <div className="space-y-2">
                    {goal.metrics.qualitative.map((metric, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#6B7280]">{metric.criteria}</span>
                          {metric.rating && (
                            <span className="text-[#111827]">Rating: {metric.rating}/5</span>
                          )}
                        </div>
                        {metric.comments && (
                          <p className="text-[#4B5563] mt-1">{metric.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {(goal.managerFeedback || goal.selfAssessment) && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              {goal.selfAssessment && (
                <div>
                  <h4 className="text-sm font-medium text-[#111827] mb-1">Self Assessment</h4>
                  <p className="text-sm text-[#4B5563]">{goal.selfAssessment}</p>
                </div>
              )}
              {goal.managerFeedback && (
                <div>
                  <h4 className="text-sm font-medium text-[#111827] mb-1">Manager Feedback</h4>
                  <p className="text-sm text-[#4B5563]">{goal.managerFeedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Peer Reviews Section */}
          {goal.status === GoalStatus.IN_REVIEW && user?.role === 'Manager' && (
            <div className="mt-4 pt-4 border-t">
              <PeerReviews goal={goal} onReviewSubmit={onGoalUpdate} />
            </div>
          )}

          {/* Competencies Section */}
          {goal.competencies && goal.competencies.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Competencies goal={goal} onCompetencyUpdate={onGoalUpdate} />
            </div>
          )}

          {/* Review Actions */}
          {goal.status === GoalStatus.ACTIVE && user?.role === 'Employee' && (
            <div className="mt-4">
              <Button
                onClick={handleSubmitForReview}
                disabled={loading || goal.progress < 100}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </div>
          )}

          {goal.status === GoalStatus.IN_REVIEW && user?.role === 'Manager' && (
            <div className="mt-4 space-y-2">
              <Button
                onClick={handleApproveReview}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Approve Review'
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const feedback = prompt('Please provide feedback for rejection:');
                  if (feedback) {
                    handleRejectReview(feedback);
                  }
                }}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Reject Review'
                )}
              </Button>
            </div>
          )}

          {/* Status Actions */}
          {goal.status === GoalStatus.DRAFT && user?.role === 'Manager' && (
            <div className="mt-4">
              <Button
                onClick={() => setIsActivateDialogOpen(true)}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Activate Goal'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isUpdateModalOpen && (
        <UpdateGoalModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          goal={goal}
          onSuccess={onGoalUpdate}
        />
      )}

      {isActivateDialogOpen && (
        <ActivateGoalDialog
          isOpen={isActivateDialogOpen}
          onClose={() => setIsActivateDialogOpen(false)}
          goal={goal}
          onSuccess={onGoalUpdate}
        />
      )}
    </>
  );
} 