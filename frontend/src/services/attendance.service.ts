import api from '@/lib/axios';
import { AttendanceType, LeaveType, AttendanceStatus } from './types';

export interface CreateAttendanceDTO {
  type: AttendanceType;
  leaveType?: LeaveType;
  reason?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface UpdateAttendanceDTO {
  status?: AttendanceStatus;
  rejectionReason?: string;
  approverId?: string;
  leaveType?: LeaveType;
  reason?: string;
}

export interface Attendance {
  id: string;
  type: AttendanceType;
  startTime: string;
  endTime?: string;
  leaveType?: LeaveType;
  reason?: string;
  status: AttendanceStatus;
  rejectionReason?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  approver?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DailyAttendance {
  date: string;
  id: string | null;
  status: AttendanceStatus;
  startTime: Date | null;
  endTime: Date | null;
  reason: string | null;
  leaveType: LeaveType | null;
  duration: number | null;
  latitude: number | null;
  longitude: number | null;
}

class AttendanceService {
  async checkIn(latitude?: number, longitude?: number): Promise<DailyAttendance> {
    const response = await api.post('/attendance/check-in', { latitude, longitude });
    return response.data;
  }

  async checkOut(): Promise<DailyAttendance> {
    const response = await api.post('/attendance/check-out');
    return response.data;
  }

  async createAttendance(data: CreateAttendanceDTO): Promise<Attendance> {
    const response = await api.post('/attendance', data);
    return response.data;
  }

  async getAllAttendance(): Promise<Attendance[]> {
    const response = await api.get('/attendance');
    return response.data;
  }

  async getPendingRequests(): Promise<Attendance[]> {
    const response = await api.get('/attendance/pending');
    return response.data;
  }

  async getUserAttendance(userId: string): Promise<Attendance[]> {
    const response = await api.get(`/attendance/user/${userId}`);
    return response.data;
  }

  async getAttendance(id: string): Promise<Attendance> {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  }

  async updateAttendance(id: string, data: Partial<DailyAttendance>): Promise<DailyAttendance> {
    const response = await api.patch(`/attendance/${id}`, data);
    return response.data;
  }

  async deleteAttendance(id: string): Promise<void> {
    await api.delete(`/attendance/${id}`);
  }

  async getMonthlyAttendance(month: number, year: number): Promise<DailyAttendance[]> {
    const response = await api.get('/attendance/monthly', {
      params: { 
        month: Number(month), 
        year: Number(year) 
      }
    });
    return response.data;
  }

  async getYearlyAttendance(startDate: string, endDate: string): Promise<DailyAttendance[]> {
    const response = await api.get('/attendance/yearly', {
      params: { startDate, endDate }
    });
    return response.data;
  }
}

export const attendanceService = new AttendanceService(); 