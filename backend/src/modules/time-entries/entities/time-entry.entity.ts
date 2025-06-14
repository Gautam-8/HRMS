import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TimeEntryType {
  ATTENDANCE = 'attendance',
  LEAVE = 'leave'
}

export enum LeaveType {
  CASUAL = 'casual',
  SICK = 'sick',
  ANNUAL = 'annual',
  UNPAID = 'unpaid',
  OTHER = 'other'
}

export enum TimeEntryStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

@Entity('time_entries')
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.timeEntries)
  user: User;

  @Column({
    type: 'enum',
    enum: TimeEntryType
  })
  type: TimeEntryType;

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
    enum: TimeEntryStatus,
    default: TimeEntryStatus.PENDING
  })
  status: TimeEntryStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @ManyToOne(() => User, { nullable: true })
  approver: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 