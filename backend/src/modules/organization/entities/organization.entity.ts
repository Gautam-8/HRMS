import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  industry: string;

  @Column()
  legalName: string;

  @Column({ nullable: true })
  panNumber: string;

  @Column({ nullable: true })
  gstNumber: string;

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @OneToMany(() => Department, department => department.organization)
  departments: Department[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 