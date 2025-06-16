import { AttendanceStatus, LeaveType } from '../entities/attendance.entity';

export interface DailyAttendance {
  date: string;
  id: string | null;
  status: AttendanceStatus | null;
  startTime: Date | null;
  endTime: Date | null;
  reason: string | null;
  leaveType: LeaveType | null;
  duration: number | null;
  latitude: number | null;
  longitude: number | null;
} 