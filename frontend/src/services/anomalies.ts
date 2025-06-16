import axios from 'axios';

export enum AnomalyType {
  ATTENDANCE = 'ATTENDANCE',
  SALARY = 'SALARY',
  PERFORMANCE = 'PERFORMANCE'
}

export enum AnomalySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum AnomalyStatus {
  DETECTED = 'DETECTED',
  REVIEWING = 'REVIEWING',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  details: Record<string, any>;
  status: AnomalyStatus;
  resolution?: string;
  resolvedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAnomalyStatusDto {
  status: AnomalyStatus;
  resolution?: string;
  resolvedBy?: string;
}

const anomaliesApi = {
  getUserAnomalies: (userId: string) => 
    axios.get<Anomaly[]>(`/api/anomalies/user/${userId}`),

  detectAnomalies: (userId: string) => 
    axios.post<Anomaly[]>(`/api/anomalies/detect/${userId}`),

  updateAnomalyStatus: (id: string, data: UpdateAnomalyStatusDto) => 
    axios.post<Anomaly>(`/api/anomalies/${id}/status`, data)
};

export default anomaliesApi; 