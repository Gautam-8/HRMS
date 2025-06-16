import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AnomalyStatus } from '../entities/anomaly.entity';

export class UpdateAnomalyStatusDto {
  @IsEnum(AnomalyStatus)
  status: AnomalyStatus;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsUUID()
  resolvedBy?: string;
} 