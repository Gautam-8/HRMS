import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrganizationModule } from './modules/organization/organization.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GoalsModule } from './modules/goals/goals.module';
import { configs } from './config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SalaryModule } from './modules/salary/salary.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ChatModule } from './modules/chat/chat.module';
import { AnomaliesModule } from './modules/anomalies/anomalies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
        ...configService.get('database')
      }),
    }),
    OrganizationModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    AttendanceModule,
    GoalsModule,
    SalaryModule,
    DashboardModule,
    ChatModule,
    AnomaliesModule
  ],
})
export class AppModule {}
