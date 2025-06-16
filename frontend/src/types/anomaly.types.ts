export enum AnomalyType {
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  EARLY_DEPARTURE = 'EARLY_DEPARTURE',
  ABSENCE = 'ABSENCE',
  OVERTIME = 'OVERTIME',
  WEEKEND_WORK = 'WEEKEND_WORK',
  PATTERN_CHANGE = 'PATTERN_CHANGE'
}

export enum AnomalySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AnomalyStatus {
  DETECTED = 'DETECTED',
  REVIEWING = 'REVIEWING',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface Anomaly {
  id: string;
  user: User;
  type: AnomalyType;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  description: string;
  details: {
    metrics: Record<string, number>;
    recommendations: string[];
  };
  resolution?: string;
  resolvedBy?: User;
  createdAt: string;
  updatedAt: string;
} 