import api from '@/lib/axios';
import { Anomaly, AnomalyType, AnomalySeverity, AnomalyStatus } from '../types/anomalies';

export interface GetAnomaliesParams {
  page?: number;
  limit?: number;
  type?: AnomalyType;
  severity?: AnomalySeverity;
  status?: AnomalyStatus;
  userId?: string;
}

export interface AnomalyResponse {
  data: Anomaly[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AnomalyStats {
  total: number;
  byType: Record<AnomalyType, number>;
  bySeverity: Record<AnomalySeverity, number>;
  byStatus: Record<AnomalyStatus, number>;
}

export interface BulkAnomalyResponse {
  [userId: string]: Anomaly[];
}

export const anomaliesService = {
  async getAnomalies(params: GetAnomaliesParams = {}): Promise<AnomalyResponse> {
    const response = await api.get('/anomalies', { params });
    return response.data;
  },

  async getAnomalyStats(): Promise<AnomalyStats> {
    const response = await api.get('/anomalies/stats');
    return response.data;
  },

  async getUserAnomalies(userId: string, params: GetAnomaliesParams = {}): Promise<AnomalyResponse> {
    const response = await api.get(`/anomalies/user/${userId}`, { params });
    return response.data;
  },

  async detectAnomalies(userId: string): Promise<Anomaly[]> {
    const response = await api.post(`/anomalies/detect/${userId}`);
    return response.data;
  },

  async detectBulkAnomalies(userIds: string[]): Promise<BulkAnomalyResponse> {
    const response = await api.post('/anomalies/detect-bulk', { userIds });
    return response.data;
  },

  async updateAnomalyStatus(
    id: string,
    status: AnomalyStatus,
    resolution?: string,
    resolvedBy?: string
  ): Promise<Anomaly> {
    const response = await api.post(`/anomalies/${id}/status`, {
      status,
      resolution,
      resolvedBy
    });
    return response.data;
  }
}; 