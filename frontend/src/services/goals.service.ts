import api from '@/lib/axios';
import { User } from './user.service';

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum GoalStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED'
}

export enum CompetencyCategory {
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  LEADERSHIP = 'LEADERSHIP',
  COMMUNICATION = 'COMMUNICATION'
}

export interface PeerReview {
  reviewerId: string;
  reviewerName: string;
  rating: number;
  feedback: string;
  submittedAt: Date;
}

export interface Competency {
  category: CompetencyCategory;
  name: string;
  description: string;
  selfRating?: number;
  selfComments?: string;
  managerRating?: number;
  managerComments?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: GoalStatus;
  priority: GoalPriority;
  weightage?: number;
  rating?: number;
  managerFeedback?: string;
  selfAssessment?: string;
  metrics?: {
    quantitative: {
      target: number;
      achieved: number;
      unit: string;
    }[];
    qualitative: {
      criteria: string;
      rating: number;
      comments: string;
    }[];
  };
  peerReviews?: PeerReview[];
  competencies?: Competency[];
  employee: User;
  manager: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoalDto {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  employeeId: string;
  priority: GoalPriority;
  weightage?: number;
  quantitativeMetrics: {
    target: number;
    unit: string;
  }[];
  qualitativeMetrics: {
    criteria: string;
  }[];
}

class GoalsService {
  async getAll() {
    return api.get<Goal[]>('/goals');
  }

  async getMyGoals(userId: string) {
    return api.get<Goal[]>(`/goals/employee/${userId}`);
  }

  async getTeamGoals(managerId: string) {
    return api.get<Goal[]>(`/goals/manager/${managerId}`);
  }

  async create(data: CreateGoalDto) {
    const payload = {
      ...data,
      startDate: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
      endDate: data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate,
    };
    return api.post<Goal>('/goals', payload);
  }

  async updateProgress(id: string, progress: number, userId: string) {
    return api.put<Goal>(`/goals/${id}/progress`, { progress }, { headers: { 'X-User-Id': userId } });
  }

  async updateMetrics(id: string, metrics: Goal['metrics'], userId: string) {
    const payload = {
      quantitative: metrics?.quantitative,
      qualitative: metrics?.qualitative,
    };
    return api.put<Goal>(`/goals/${id}/metrics`, payload, { headers: { 'X-User-Id': userId } });
  }

  async submitFeedback(id: string, feedback: string, rating: number | undefined, isManager: boolean, userId: string) {
    const payload = { feedback, rating, isManager };
    return api.put<Goal>(`/goals/${id}/feedback`, payload, { headers: { 'X-User-Id': userId } });
  }

  async getTeamMetrics(managerId: string) {
    return api.get<{
      employee: User;
      totalGoals: number;
      completedGoals: number;
      averageProgress: number;
      averageRating: number | null;
    }[]>(`/goals/team-metrics/${managerId}`);
  }

  async addPeerReview(id: string, rating: number, feedback: string, userId: string) {
    return api.post(`/goals/${id}/peer-review`, { rating, feedback }, { headers: { 'X-User-Id': userId } });
  }

  async updateCompetencies(id: string, competencies: Competency[], isManager: boolean, userId: string) {
    return api.put(`/goals/${id}/competencies`, { competencies, isManager }, { headers: { 'X-User-Id': userId } });
  }

  async submitForReview(id: string) {
    return api.post<Goal>(`/goals/${id}/submit-review`);
  }

  async approveReview(id: string) {
    return api.post<Goal>(`/goals/${id}/approve-review`);
  }

  async rejectReview(id: string, feedback: string) {
    return api.post<Goal>(`/goals/${id}/reject-review`, { feedback });
  }

  async activateGoal(id: string, feedback: string) {
    return api.post<Goal>(`/goals/${id}/activate`, { feedback });
  }
}

export const goalsService = new GoalsService(); 