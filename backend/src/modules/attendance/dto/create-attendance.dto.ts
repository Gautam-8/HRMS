import { IsString, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { LeaveType } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(LeaveType)
  @IsOptional()
  leaveType?: LeaveType;
} 