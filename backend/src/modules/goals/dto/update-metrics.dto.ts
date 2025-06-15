import { IsArray, ValidateNested, IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class QuantitativeMetric {
  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsNumber()
  @IsNotEmpty()
  achieved: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

class QualitativeMetric {
  @IsString()
  @IsNotEmpty()
  criteria: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comments: string;
}

export class UpdateMetricsDto {
  @ValidateNested({ each: true })
  @Type(() => QuantitativeMetric)
  @IsArray()
  @IsOptional()
  quantitative?: QuantitativeMetric[];

  @ValidateNested({ each: true })
  @Type(() => QualitativeMetric)
  @IsArray()
  @IsOptional()
  qualitative?: QualitativeMetric[];
} 