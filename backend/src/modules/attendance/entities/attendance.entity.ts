import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, Check } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

@Entity('attendance')
@Index(['user', 'date'], { unique: true })
@Check(`"endTime" > "startTime"`)
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.attendance)
  user: User;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ type: 'float', nullable: true })
  duration: number | null;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: null,
    nullable: true
  })
  status: AttendanceStatus | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: LeaveType,
    nullable: true
  })
  leaveType: LeaveType | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @ManyToOne(() => User, { nullable: true })
  approver: User | null;

  @Column({ type: 'boolean', default: false })
  isHalfDay: boolean;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 