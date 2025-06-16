import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AnomalyType {
  ATTENDANCE = 'ATTENDANCE',
  SALARY = 'SALARY',
  PERFORMANCE = 'PERFORMANCE'
}

export enum AnomalySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum AnomalyStatus {
  DETECTED = 'DETECTED',
  REVIEWING = 'REVIEWING',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

@Entity('anomalies')
export class Anomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: AnomalyType
  })
  type: AnomalyType;

  @Column({
    type: 'enum',
    enum: AnomalySeverity
  })
  severity: AnomalySeverity;

  @Column({
    type: 'enum',
    enum: AnomalyStatus,
    default: AnomalyStatus.DETECTED
  })
  status: AnomalyStatus;

  @Column('text')
  description: string;

  @Column('jsonb', { nullable: true })
  details: Record<string, any>;

  @Column('text', { nullable: true })
  resolution: string;

  @ManyToOne(() => User, { nullable: true })
  resolvedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 