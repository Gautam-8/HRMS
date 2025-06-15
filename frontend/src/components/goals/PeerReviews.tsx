import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Star, Loader2 } from 'lucide-react';
import { Goal, PeerReview } from '@/services/goals.service';

interface PeerReviewsProps {
  goal: Goal;
  onReviewSubmit?: () => void;
}

export function PeerReviews({ goal, onReviewSubmit }: PeerReviewsProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!feedback.trim()) {
      toast({
        title: 'Feedback required',
        description: 'Please provide feedback before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to submit review
      await onReviewSubmit?.();
      setRating(0);
      setFeedback('');
      toast({
        title: 'Review submitted',
        description: 'Your peer review has been submitted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-[#111827]">Peer Reviews</h3>
      </CardHeader>
      <CardContent>
        {/* Existing Reviews */}
        {goal.peerReviews && goal.peerReviews.length > 0 && (
          <div className="space-y-4 mb-6">
            {goal.peerReviews.map((review: PeerReview, index: number) => (
              <div key={index} className="space-y-2 p-4 bg-[#F9FAFB] rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#111827]">{review.reviewerName}</p>
                    <p className="text-sm text-[#6B7280]">
                      {format(new Date(review.submittedAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#4B5563]">{review.feedback}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submit Review Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#111827] mb-2 block">
              Rating
            </label>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleRatingClick(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#111827] mb-2 block">
              Feedback
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your feedback..."
              className="min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !rating || !feedback.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 