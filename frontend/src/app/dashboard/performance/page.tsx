'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBar, Star, Target, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GoalsList } from '@/components/goals/GoalsList';
import { CreateGoalModal } from '@/components/goals/CreateGoalModal';
import { Goal, GoalStatus, goalsService } from '@/services/goals.service';
import { User } from '@/services/user.service';
import { useToast } from '@/components/ui/use-toast';
import { SelectEmployeeDialog } from '@/components/goals/SelectEmployeeDialog';
import { Progress } from '@/components/ui/progress';

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<{
    employee: { id: string; name: string };
    totalGoals: number;
    completedGoals: number;
    averageProgress: number;
    averageRating: number | null;
  }[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectEmployeeOpen, setIsSelectEmployeeOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let response;
      
      if (user.role === 'Manager') {
        response = await goalsService.getTeamGoals(user.id);
      } else if (user.role === 'HR') {
        response = await goalsService.getAll();
      } else {
        response = await goalsService.getMyGoals(user.id);
      }

      setGoals(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch goals.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMetrics = async () => {
    if (!user) return;
    try {
      if (user.role === 'Manager') {
        const response = await goalsService.getTeamMetrics(user.id);
        setTeamMetrics(response.data.map(metric => ({
          ...metric,
          employee: {
            id: metric.employee.id,
            name: `${metric.employee.fullName}`
          }
        })));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch team metrics.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchGoals();
      fetchTeamMetrics();
    }
  }, [isAuthLoading]);

  const handleCreateGoal = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsSelectEmployeeOpen(false);
    setIsCreateModalOpen(true);
  };


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Performance Management</h1>
        {user?.role === 'Manager' && (
          <Button onClick={() => setIsSelectEmployeeOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <ChartBar className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
          {user?.role === 'Manager' && (
            <TabsTrigger value="team">
              <Star className="h-4 w-4 mr-2" />
              Team Performance
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Goals Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Goals</span>
                    <span className="text-sm font-medium">{goals.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm font-medium">
                      {goals.filter(g => g.status === GoalStatus.COMPLETED).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">In Review</span>
                    <span className="text-sm font-medium">
                      {goals.filter(g => g.status === GoalStatus.IN_REVIEW).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals
                    .filter(goal => goal.progress > 0)
                    .sort((a, b) => b.progress - a.progress)
                    .slice(0, 3)
                    .map((goal) => (
                      <div key={goal.id}>
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">{goal.title}</h3>
                          <span className="text-sm font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="mt-2" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals
                    .filter((g) => g.managerFeedback || g.selfAssessment)
                    .slice(0, 3)
                    .map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <h3 className="text-sm font-medium">{goal.title}</h3>
                        {goal.managerFeedback && (
                          <p className="text-sm text-muted-foreground">
                            Manager: {goal.managerFeedback}
                          </p>
                        )}
                        {goal.selfAssessment && (
                          <p className="text-sm text-muted-foreground">
                            Self: {goal.selfAssessment}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Peer Reviews Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Peer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals
                    .flatMap(goal => (goal.peerReviews || []).map(review => ({
                      ...review,
                      goalTitle: goal.title
                    })))
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                    .slice(0, 3)
                    .map((review, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{review.reviewerName}</span>
                          <span className="text-xs text-muted-foreground">{review.goalTitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold">{'★'.repeat(review.rating)}</span>
                          <span className="text-xs text-muted-foreground">{new Date(review.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-[#4B5563]">{review.feedback}</div>
                      </div>
                    ))}
                  {goals.flatMap(goal => goal.peerReviews || []).length === 0 && (
                    <div className="text-muted-foreground text-sm">No peer reviews yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="space-y-6">
            <GoalsList
              goals={goals}
              user={user!}
              onGoalUpdate={fetchGoals}
            />
          </div>
        </TabsContent>

        {user?.role === 'Manager' && (
          <TabsContent value="team">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMetrics.map((member) => (
                <Card key={member.employee.id}>
                  <CardHeader>
                    <CardTitle>{member.employee.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Goals</span>
                        <span className="text-sm font-medium">{member.totalGoals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="text-sm font-medium">{member.completedGoals}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Progress</span>
                          <span className="text-sm font-medium">{member.averageProgress}%</span>
                        </div>
                        <Progress value={member.averageProgress} />
                      </div>
                      {member.averageRating !== null && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Average Rating</span>
                          <span className="text-sm font-medium">{member.averageRating.toFixed(1)}/5</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {isCreateModalOpen && (
        <CreateGoalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          employeeId={selectedEmployeeId}
          onSuccess={fetchGoals}
        />
      )}

      {isSelectEmployeeOpen && (
        <SelectEmployeeDialog
          isOpen={isSelectEmployeeOpen}
          onClose={() => setIsSelectEmployeeOpen(false)}
          onSelect={handleCreateGoal}
        />
      )}
    </>
  );
} 