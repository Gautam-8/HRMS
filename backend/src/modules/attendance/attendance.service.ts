import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between, LessThanOrEqual } from 'typeorm';
import { Attendance, AttendanceStatus, LeaveType } from './entities/attendance.entity';
import { User } from '../users/entities/user.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, differenceInHours, startOfDay, isAfter, isBefore, isWeekend } from 'date-fns';
import { DailyAttendance } from './types/attendance.types';

@Injectable()
export class AttendanceService {
  private holidays = [
    '2024-01-01', // New Year
    '2024-01-26', // Republic Day
    '2024-08-15', // Independence Day
    '2024-10-02', // Gandhi Jayanti
    // Add more holidays as needed
  ];

  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private isHoliday(date: Date): boolean {
    const dateStr = format(date, 'yyyy-MM-dd');
    return this.holidays.includes(dateStr);
  }

  private async validateLeaveRequest(userId: string, startDate: Date, endDate: Date) {
    // Check for overlapping leaves
    const existingLeave = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        date: Between(startDate, endDate),
        status: AttendanceStatus.LEAVE_PENDING || AttendanceStatus.LEAVE_APPROVED
      }
    });

    if (existingLeave) {
      throw new BadRequestException('Leave request overlaps with existing leave');
    }

    // Check if dates are in the past
    if (isBefore(startDate, startOfDay(new Date()))) {
      throw new BadRequestException('Cannot apply leave for past dates');
    }

    // Check if it's a holiday or weekend
    if (isWeekend(startDate) || this.isHoliday(startDate)) {
      throw new BadRequestException('Cannot apply leave for holidays or weekends');
    }
  }

  async getMonthlyAttendance(userId: string, month: number, year: number): Promise<DailyAttendance[]> {
    // Ensure we're working with dates in the correct timezone
    const startDate = startOfMonth(new Date(Date.UTC(year, month - 1)));
    const endDate = endOfMonth(new Date(Date.UTC(year, month - 1)));
    const today = new Date();

    const datesInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        user: { id: userId },
        date: Between(startDate, endDate)
      }
    });

    const attendanceMap = new Map(
      attendanceRecords.map(record => [
        format(record.date, 'yyyy-MM-dd'),
        record
      ])
    );

    // Create array with all dates, filling in null for missing records
    const monthlyAttendance = datesInMonth.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const record = attendanceMap.get(dateStr);
      
      // Create a UTC date for weekend check to avoid timezone issues
      const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const isWeekendDay = isWeekend(utcDate);
      const isHolidayDay = this.isHoliday(date);
      const isFutureDate = isAfter(date, today);

      // If there's an existing record, return it unless it's incorrectly marked as weekend
      if (record) {
        // If it's a weekend but marked as something else, or not a weekend but marked as weekend,
        // we should override the status
        if ((isWeekendDay && record.status !== AttendanceStatus.WEEKEND) || 
            (!isWeekendDay && record.status === AttendanceStatus.WEEKEND)) {
          return {
            date: dateStr,
            id: record.id,
            status: isWeekendDay ? AttendanceStatus.WEEKEND : 
                    isHolidayDay ? AttendanceStatus.HOLIDAY :
                    isFutureDate ? null : AttendanceStatus.ABSENT,
            startTime: null,
            endTime: null,
            reason: null,
            leaveType: null,
            duration: null
          };
        }
        return {
          date: dateStr,
          id: record.id,
          status: record.status,
          startTime: record.startTime,
          endTime: record.endTime,
          reason: record.reason,
          leaveType: record.leaveType,
          duration: record.duration || (record.endTime && record.startTime ? 
            differenceInHours(record.endTime, record.startTime) 
            : null)
        };
      }

      // For dates without records
      return {
        date: dateStr,
        id: null,
        status: isFutureDate ? null : 
               isHolidayDay ? AttendanceStatus.HOLIDAY :
               isWeekendDay ? AttendanceStatus.WEEKEND : 
               AttendanceStatus.ABSENT,
        startTime: null,
        endTime: null,
        reason: null,
        leaveType: null,
        duration: null
      };
    });

    return monthlyAttendance;
  }

  async getYearlyAttendance(userId: string, startDate: string, endDate: string): Promise<DailyAttendance[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    const datesInRange = eachDayOfInterval({ start, end });

    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        user: { id: userId },
        date: Between(start, end)
      }
    });

    const attendanceMap = new Map(
      attendanceRecords.map(record => [
        format(record.date, 'yyyy-MM-dd'),
        record
      ])
    );

    // Create array with all dates, filling in null for missing records
    const yearlyAttendance = datesInRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const record = attendanceMap.get(dateStr);
      const isWeekendDay = isWeekend(date);
      const isHoliday = this.isHoliday(date);
      const isFutureDate = isAfter(date, today);

      if (record) {
        return {
          date: dateStr,
          id: record.id,
          status: record.status,
          startTime: record.startTime,
          endTime: record.endTime,
          reason: record.reason,
          leaveType: record.leaveType,
          duration: record.duration || (record.endTime && record.startTime ? 
            differenceInHours(record.endTime, record.startTime) 
            : null)
        };
      }

      // For dates without records
      return {
        date: dateStr,
        id: null,
        status: isFutureDate ? null : 
               isHoliday ? AttendanceStatus.HOLIDAY :
               isWeekendDay ? AttendanceStatus.WEEKEND : 
               AttendanceStatus.ABSENT,
        startTime: null,
        endTime: null,
        reason: null,
        leaveType: null,
        duration: null
      };
    });

    return yearlyAttendance;
  }

  async checkIn(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = startOfDay(new Date());

    // Check if it's a holiday or weekend
    if (isWeekend(today) || this.isHoliday(today)) {
      throw new BadRequestException('Cannot check in on holidays or weekends');
    }

    // Check if user already has an attendance record for today
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        date: today
      }
    });

    if (existingAttendance) {
      throw new BadRequestException('Already checked in for today');
    }

    const attendance = this.attendanceRepository.create({
      user,
      date: today,
      startTime: new Date(),
      status: AttendanceStatus.PRESENT,
      duration: 0
    });

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(userId: string) {
    const today = startOfDay(new Date());
    const attendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        date: today,
        endTime: IsNull()
      }
    });

    if (!attendance) {
      throw new BadRequestException('No active check-in found for today');
    }

    attendance.endTime = new Date();
    attendance.duration = differenceInHours(attendance.endTime, attendance.startTime!);

    return this.attendanceRepository.save(attendance);
  }

  async create(createAttendanceDto: CreateAttendanceDto) {
    const user = await this.userRepository.findOne({
      where: { id: createAttendanceDto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const startDate = new Date(createAttendanceDto.startDate);
    const endDate = createAttendanceDto.endDate ? new Date(createAttendanceDto.endDate) : startDate;

    if (createAttendanceDto.leaveType) {
      await this.validateLeaveRequest(user.id, startDate, endDate);

      // For leave requests, create an attendance record for each day
      const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
      const attendanceRecords: Attendance[] = [];

      for (const date of datesInRange) {
        // Skip weekends and holidays
        if (isWeekend(date) || this.isHoliday(date)) {
          continue;
        }

        const attendance = this.attendanceRepository.create({
          ...createAttendanceDto,
          user,
          date,
          startTime: null,
          endTime: null,
          status: AttendanceStatus.LEAVE_PENDING,
          isHalfDay: createAttendanceDto.leaveType === LeaveType.HALF_DAY
        });

        attendanceRecords.push(attendance);
      }

      if (attendanceRecords.length === 0) {
        throw new BadRequestException('No valid dates found in the selected range (excluding weekends and holidays)');
      }

      return this.attendanceRepository.save(attendanceRecords);
    }

    // For regular attendance
    const attendance = this.attendanceRepository.create({
      ...createAttendanceDto,
      user,
      date: startDate,
      startTime: createAttendanceDto.startTime ? new Date(createAttendanceDto.startTime) : null,
      endTime: createAttendanceDto.endTime ? new Date(createAttendanceDto.endTime) : null,
      isHalfDay: false
    });

    if (attendance.startTime && attendance.endTime) {
      attendance.duration = differenceInHours(attendance.endTime, attendance.startTime);
    }

    return this.attendanceRepository.save(attendance);
  }

  async findAll() {
    return this.attendanceRepository.find({
      relations: ['user', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    return this.attendanceRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['user', 'approver'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.findOne(id);

    if (updateAttendanceDto.approverId) {
      const approver = await this.userRepository.findOne({
        where: { id: updateAttendanceDto.approverId },
      });
      if (!approver) {
        throw new NotFoundException('Approver not found');
      }
      attendance.approver = approver;
    }

    Object.assign(attendance, updateAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async updateLeaveStatus(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.findOne(id);

    if (!attendance.leaveType) {
      throw new BadRequestException('This is not a leave request');
    }

    if (updateAttendanceDto.approverId) {
      const approver = await this.userRepository.findOne({
        where: { id: updateAttendanceDto.approverId },
      });
      if (!approver) {
        throw new NotFoundException('Approver not found');
      }
      attendance.approver = approver;
    }

    // Only allow updating leave status
    if (updateAttendanceDto.status) {
      if (![AttendanceStatus.LEAVE_APPROVED, AttendanceStatus.LEAVE_REJECTED].includes(updateAttendanceDto.status)) {
        throw new BadRequestException('Invalid leave status');
      }
      attendance.status = updateAttendanceDto.status;
    }

    if (updateAttendanceDto.rejectionReason) {
      attendance.rejectionReason = updateAttendanceDto.rejectionReason;
    }

    return this.attendanceRepository.save(attendance);
  }

  async getPendingLeaveRequests() {
    return this.attendanceRepository.find({
      where: { status: AttendanceStatus.LEAVE_PENDING },
      relations: ['user', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const attendance = await this.findOne(id);
    return this.attendanceRepository.remove(attendance);
  }
} 