import api from '@/lib/axios';

export enum ReviewCycleType {
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

export enum ReviewCycleStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum ReviewStageType {
  SELF_ASSESSMENT = 'SELF_ASSESSMENT',
  MANAGER_REVIEW = 'MANAGER_REVIEW',
  HR_REVIEW = 'HR_REVIEW',
  CALIBRATION = 'CALIBRATION',
  FINALIZATION = 'FINALIZATION'
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  SELF_ASSESSMENT_IN_PROGRESS = 'SELF_ASSESSMENT_IN_PROGRESS',
  SELF_ASSESSMENT_COMPLETED = 'SELF_ASSESSMENT_COMPLETED',
  MANAGER_REVIEW_IN_PROGRESS = 'MANAGER_REVIEW_IN_PROGRESS',
  MANAGER_REVIEW_COMPLETED = 'MANAGER_REVIEW_COMPLETED',
  HR_REVIEW_IN_PROGRESS = 'HR_REVIEW_IN_PROGRESS',
  HR_REVIEW_COMPLETED = 'HR_REVIEW_COMPLETED',
  COMPLETED = 'COMPLETED'
}

export interface ReviewStage {
  type: ReviewStageType;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface RatingScale {
  min: number;
  max: number;
  labels: { value: number; label: string }[];
}

export interface ReviewCycle {
  id: string;
  name: string;
  type: ReviewCycleType;
  status: ReviewCycleStatus;
  startDate: Date;
  endDate: Date;
  stages: ReviewStage[];
  departments?: string[];
  includeGoals: boolean;
  includeCompetencies: boolean;
  ratingScale: RatingScale;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  cycle: ReviewCycle;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: ReviewStatus;
  competencies?: {
    category: string;
    name: string;
    description: string;
    selfRating?: number;
    selfComments?: string;
    managerRating?: number;
    managerComments?: string;
  }[];
  goals?: {
    goalId: string;
    title: string;
    targetDate: Date;
    achievement: string;
    selfRating?: number;
    selfComments?: string;
    managerRating?: number;
    managerComments?: string;
  }[];
  selfAssessment?: {
    strengths: string;
    improvements: string;
    aspirations: string;
    additionalComments?: string;
    submittedAt?: Date;
  };
  managerAssessment?: {
    strengths: string;
    improvements: string;
    developmentPlan: string;
    additionalComments?: string;
    submittedAt?: Date;
  };
  finalRating?: number;
  hrComments?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewCycleAnalytics {
  totalReviews: number;
  completedReviews: number;
  completionRate: number;
  ratingDistribution: Record<number, number>;
  departmentAverages: Record<string, number>;
  cycleProgress: {
    startDate: Date;
    endDate: Date;
    currentStage: ReviewStageType | 'COMPLETED';
    stagesProgress: ReviewStage[];
  };
}

class ReviewsService {
  async createCycle(data: Omit<ReviewCycle, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    const response = await api.post<ReviewCycle>('/review-cycles', data);
    return response.data;
  }

  async getAllCycles() {
    const response = await api.get<ReviewCycle[]>('/review-cycles');
    return response.data;
  }

  async getActiveCycles() {
    const response = await api.get<ReviewCycle[]>('/review-cycles/active');
    return response.data;
  }

  async getCycle(id: string) {
    const response = await api.get<ReviewCycle>(`/review-cycles/${id}`);
    return response.data;
  }

  async completeStage(cycleId: string, stage: ReviewStageType) {
    const response = await api.post<ReviewCycle>(
      `/review-cycles/${cycleId}/stages/${stage}/complete`
    );
    return response.data;
  }

  async getCycleAnalytics(id: string) {
    const response = await api.get<ReviewCycleAnalytics>(`/review-cycles/${id}/analytics`);
    return response.data;
  }

  async startReview(data: { cycleId: string; employeeId: string }) {
    const response = await api.post<Review>(`/review-cycles/${data.cycleId}/reviews`, {
      employeeId: data.employeeId
    });
    return response.data;
  }
}

export const reviewsService = new ReviewsService(); 