import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum GoalStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED'
}

export enum CompetencyCategory {
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  LEADERSHIP = 'LEADERSHIP',
  COMMUNICATION = 'COMMUNICATION'
}

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'int',
    default: 0
  })
  progress: number;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.DRAFT
  })
  status: GoalStatus;

  @Column({
    type: 'enum',
    enum: GoalPriority,
    default: GoalPriority.MEDIUM
  })
  priority: GoalPriority;

  @Column({ type: 'float', nullable: true })
  weightage: number;

  @Column({ type: 'float', nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  managerFeedback: string;

  @Column({ type: 'text', nullable: true })
  selfAssessment: string;

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    quantitative: {
      target: number;
      achieved: number;
      unit: string;
    }[];
    qualitative: {
      criteria: string;
      rating: number;
      comments: string;
    }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  peerReviews: {
    reviewerId: string;
    reviewerName: string;
    rating: number;
    feedback: string;
    submittedAt: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  competencies: {
    category: CompetencyCategory;
    name: string;
    description: string;
    selfRating?: number;
    selfComments?: string;
    managerRating?: number;
    managerComments?: string;
  }[];

  @ManyToOne(() => User)
  employee: User;

  @ManyToOne(() => User)
  manager: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 