import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus, LeaveType } from '../entities/attendance.entity';

export class UpdateAttendanceDto {
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsUUID()
  @IsOptional()
  approverId?: string;

  @IsEnum(LeaveType)
  @IsOptional()
  leaveType?: LeaveType;

  @IsString()
  @IsOptional()
  reason?: string;
} 