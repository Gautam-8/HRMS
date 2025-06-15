import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GoalPriority } from '../entities/goal.entity';

class QuantitativeMetric {
  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsNumber()
  @IsOptional()
  achieved?: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

class QualitativeMetric {
  @IsString()
  @IsNotEmpty()
  criteria: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @IsEnum(GoalPriority)
  @IsOptional()
  priority?: GoalPriority;

  @IsNumber()
  @IsOptional()
  weightage?: number;

  @ValidateNested({ each: true })
  @Type(() => QuantitativeMetric)
  @IsArray()
  @IsOptional()
  quantitativeMetrics?: QuantitativeMetric[];

  @ValidateNested({ each: true })
  @Type(() => QualitativeMetric)
  @IsArray()
  @IsOptional()
  qualitativeMetrics?: QualitativeMetric[];
} 