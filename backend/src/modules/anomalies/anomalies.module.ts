import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnomaliesService } from './anomalies.service';
import { AnomaliesController } from './anomalies.controller';
import { Anomaly } from './entities/anomaly.entity';
import { AttendanceModule } from '../attendance/attendance.module';
import { ChatModule } from '../chat/chat.module';
import { Document } from '../chat/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anomaly, Document]),
    AttendanceModule,
    ChatModule
  ],
  controllers: [AnomaliesController],
  providers: [AnomaliesService],
  exports: [AnomaliesService]
})
export class AnomaliesModule {} 