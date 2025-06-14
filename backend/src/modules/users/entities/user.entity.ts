import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { Department } from '../../departments/entities/department.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  designation: string;

  @ManyToOne(() => Department, department => department.employees, { nullable: true })
  department: Department;

  @Column({
    type: 'enum',
    enum: ['CEO', 'CTO', 'HR', 'Manager', 'Employee'],
    default: 'HR'
  })
  role: string;

  @OneToMany(() => Department, department => department.departmentHead)
  departmentsManaged: Department[];

  @ManyToOne(() => Organization, organization => organization.users)
  organization: Organization;

  @OneToMany(() => Attendance, attendance => attendance.user)
  attendance: Attendance[];

  @OneToMany(() => Attendance, attendance => attendance.approver)
  approvedAttendance: Attendance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  isOnboarded: boolean;
} 