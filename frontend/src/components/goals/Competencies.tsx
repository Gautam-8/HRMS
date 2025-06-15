import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Star, Loader2 } from 'lucide-react';
import { Goal, CompetencyCategory, Competency } from '@/services/goals.service';
import { useAuth } from '@/hooks/use-auth';

interface CompetenciesProps {
  goal: Goal;
  onCompetencyUpdate?: () => void;
}

export function Competencies({ goal, onCompetencyUpdate }: CompetenciesProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [competencies, setCompetencies] = useState<Competency[]>(goal.competencies || []);

  const isManager = user?.role === 'Manager';

  const handleRatingChange = (index: number, rating: number) => {
    const updatedCompetencies = [...competencies];
    if (isManager) {
      updatedCompetencies[index].managerRating = rating;
    } else {
      updatedCompetencies[index].selfRating = rating;
    }
    setCompetencies(updatedCompetencies);
  };

  const handleCommentsChange = (index: number, comments: string) => {
    const updatedCompetencies = [...competencies];
    if (isManager) {
      updatedCompetencies[index].managerComments = comments;
    } else {
      updatedCompetencies[index].selfComments = comments;
    }
    setCompetencies(updatedCompetencies);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Call API to update competencies
      await onCompetencyUpdate?.();
      toast({
        title: 'Competencies updated',
        description: 'Your competency assessments have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update competencies. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: CompetencyCategory) => {
    const labels: Record<CompetencyCategory, string> = {
      [CompetencyCategory.TECHNICAL]: 'Technical Skills',
      [CompetencyCategory.BEHAVIORAL]: 'Behavioral Skills',
      [CompetencyCategory.LEADERSHIP]: 'Leadership Skills',
      [CompetencyCategory.COMMUNICATION]: 'Communication Skills'
    };
    return labels[category];
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-[#111827]">Competencies</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {competencies.map((competency: Competency, index: number) => (
            <div key={index} className="space-y-4 p-4 bg-[#F9FAFB] rounded-lg">
              <div>
                <span className="text-sm font-medium text-[#6B7280]">
                  {getCategoryLabel(competency.category)}
                </span>
                <h4 className="text-base font-medium text-[#111827] mt-1">
                  {competency.name}
                </h4>
                <p className="text-sm text-[#4B5563] mt-1">
                  {competency.description}
                </p>
              </div>

              {/* Self Assessment */}
              {!isManager && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">
                    Self Rating
                  </label>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRatingChange(index, i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            i < (competency.selfRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={competency.selfComments || ''}
                    onChange={(e) => handleCommentsChange(index, e.target.value)}
                    placeholder="Add your comments..."
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Manager Assessment */}
              {isManager && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#111827]">
                    Manager Rating
                  </label>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRatingChange(index, i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            i < (competency.managerRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={competency.managerComments || ''}
                    onChange={(e) => handleCommentsChange(index, e.target.value)}
                    placeholder="Add your feedback..."
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Display other party's assessment */}
              {isManager && competency.selfRating !== undefined && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-[#111827] mb-2">
                    Self Assessment
                  </h5>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < competency.selfRating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {competency.selfComments && (
                    <p className="text-sm text-[#4B5563]">
                      {competency.selfComments}
                    </p>
                  )}
                </div>
              )}

              {!isManager && competency.managerRating !== undefined && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-[#111827] mb-2">
                    Manager Assessment
                  </h5>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < competency.managerRating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {competency.managerComments && (
                    <p className="text-sm text-[#4B5563]">
                      {competency.managerComments}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Competencies'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 