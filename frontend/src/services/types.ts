export enum AttendanceType {
  REGULAR = 'REGULAR',
  LEAVE = 'LEAVE'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  WEEKEND = 'WEEKEND',
  HOLIDAY = 'HOLIDAY',
  LEAVE_PENDING = 'LEAVE_PENDING',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  REGULARIZATION_PENDING = 'REGULARIZATION_PENDING'
}

export enum LeaveType {
  CASUAL = 'CASUAL',
  SICK = 'SICK',
  HALF_DAY = 'HALF_DAY'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  departmentId: string | null;
} 