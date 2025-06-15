import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Goal } from '../goals/entities/goal.entity';
import { Salary } from '../salary/entities/salary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Attendance, Goal, Salary]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {} 