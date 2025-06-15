import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Goal, goalsService, GoalStatus } from '@/services/goals.service';
import { useToast } from '@/components/ui/use-toast';
import { GoalCard } from './GoalCard';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { User } from '@/services/user.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';

interface GoalsListProps {
  goals: Goal[];
  user: User;
  onProgressUpdate?: (goalId: string, progress: number) => Promise<void>;
  onGoalUpdate?: () => void;
}

export function GoalsList({ goals, user, onGoalUpdate }: GoalsListProps) {
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate summary statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
  const inReviewGoals = goals.filter(g => g.status === GoalStatus.IN_REVIEW).length;
  const activeGoals = goals.filter(g => g.status === GoalStatus.ACTIVE).length;
  const averageProgress = Math.round(
    goals.reduce((acc, goal) => acc + goal.progress, 0) / (totalGoals || 1)
  );

  const filteredGoals = statusFilter === 'ALL' 
    ? goals 
    : goals.filter(goal => goal.status === statusFilter);


  const handleExport = () => {
    // Prepare the data for export
    const exportData = goals.map(goal => ({
      Title: goal.title,
      Description: goal.description,
      Status: goal.status,
      Progress: `${goal.progress}%`,
      Priority: goal.priority,
      StartDate: new Date(goal.startDate).toLocaleDateString(),
      EndDate: new Date(goal.endDate).toLocaleDateString(),
      Employee: `${goal.employee.fullName}`,
      Manager: `${goal.manager.fullName}`,
      QuantitativeMetrics: goal.metrics?.quantitative?.map(m => 
        `${m.unit}: ${m.achieved}/${m.target}`
      ).join('; ') || 'N/A',
      QualitativeMetrics: goal.metrics?.qualitative?.map(m =>
        `${m.criteria}: ${m.rating || 'Not Rated'}`
      ).join('; ') || 'N/A',
      ManagerFeedback: goal.managerFeedback || 'N/A',
      SelfAssessment: goal.selfAssessment || 'N/A'
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof typeof row])
        ).join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `goals_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-[#6B7280]">Total Goals</div>
          <div className="text-2xl font-semibold text-[#111827] mt-1">{totalGoals}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-[#6B7280]">Completed</div>
          <div className="text-2xl font-semibold text-[#059669] mt-1">{completedGoals}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-[#6B7280]">In Review</div>
          <div className="text-2xl font-semibold text-[#7C3AED] mt-1">{inReviewGoals}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-[#6B7280]">Active</div>
          <div className="text-2xl font-semibold text-[#2563EB] mt-1">{activeGoals}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-[#6B7280]">Avg. Progress</div>
          <div className="text-2xl font-semibold text-[#111827] mt-1">{averageProgress}%</div>
        </Card>
      </div>

      {/* Filters and Export */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6B7280]" />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as GoalStatus | 'ALL')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Goals</SelectItem>
              <SelectItem value={GoalStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={GoalStatus.IN_REVIEW}>In Review</SelectItem>
              <SelectItem value={GoalStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onGoalUpdate={onGoalUpdate}
          />
        ))}
        {filteredGoals.length === 0 && (
          <div className="text-center py-12 text-[#6B7280]">
            No goals found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
} 