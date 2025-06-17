import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Attendance, AttendanceStatus } from '../attendance/entities/attendance.entity';
import { Goal } from '../goals/entities/goal.entity';
import { Salary } from '../salary/entities/salary.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
  ) {}

  async getDashboardStats(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization']
    });
    const organizationId = user?.organization.id;
    const totalEmployees = await this.userRepository.count({
      where: { organization: { id: organizationId } }
    });
    
    const todayAttendance = await this.attendanceRepository.count({
      where: { 
        date: new Date(),
        user: { organization: { id: organizationId } }
      },
    });
    
    const attendanceDescription = `${todayAttendance} employees present today`;
    
    const pendingRequests = await this.attendanceRepository.count({
      where: { 
        status: AttendanceStatus.LEAVE_PENDING,
        user: { organization: { id: organizationId } }
      },
    });
    
    const onboarding = await this.userRepository.count({
      where: { 
        isOnboarded: false,
        organization: { id: organizationId }
      },
    });
    
    const recentActivity = await this.getRecentActivity(userId);

    return {
      totalEmployees,
      todayAttendance,
      attendanceDescription,
      pendingRequests,
      onboarding,
      recentActivity,
    };
  }

  private async getRecentActivity(userId: string) {
    const recentAttendance = await this.attendanceRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
      take: 5,
    });
    const recentGoals = await this.goalRepository.find({
      where: { employee: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    const recentSalaries = await this.salaryRepository.find({
      where: { user: { id: userId } },
      order: { effectiveDate: 'DESC' },
      take: 5,
    });

    const activity = [
      ...recentAttendance.map(a => `Attendance: ${a.date}`),
      ...recentGoals.map(g => `Goal: ${g.title}`),
      ...recentSalaries.map(s => `Salary: ${s.amount}`),
    ];

    return activity;
  }
} 