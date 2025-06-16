import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AnomalyType, AnomalySeverity, AnomalyStatus } from '../entities/anomaly.entity';

export class GetAnomaliesDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(AnomalyType)
  type?: AnomalyType;

  @IsOptional()
  @IsEnum(AnomalySeverity)
  severity?: AnomalySeverity;

  @IsOptional()
  @IsEnum(AnomalyStatus)
  status?: AnomalyStatus;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
} 