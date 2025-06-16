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
  status: AnomalyStatus;
  description: string;
  details: {
    metrics: Record<string, number>;
    recommendations: string[];
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
  resolvedById?: string;
} 