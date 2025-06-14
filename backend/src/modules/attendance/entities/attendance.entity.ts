import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AttendanceType {
  REGULAR = 'regular',
  LEAVE = 'leave'
}

export enum LeaveType {
  CASUAL = 'casual',
  SICK = 'sick',
  ANNUAL = 'annual',
  UNPAID = 'unpaid',
  OTHER = 'other'
}

export enum AttendanceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.attendance)
  user: User;

  @Column({
    type: 'enum',
    enum: AttendanceType
  })
  type: AttendanceType;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: LeaveType,
    nullable: true
  })
  leaveType: LeaveType;

  @Column({ nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PENDING
  })
  status: AttendanceStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @ManyToOne(() => User, { nullable: true })
  approver: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 