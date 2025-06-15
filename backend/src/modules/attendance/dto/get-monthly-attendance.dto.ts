import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMonthlyAttendanceDto {
  @IsNumber()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsNumber()
  @Min(2000)
  @Type(() => Number)
  year: number;
} 