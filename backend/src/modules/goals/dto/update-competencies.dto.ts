import { IsEnum, IsString, IsNumber, IsOptional, Min, Max, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CompetencyCategory } from '../entities/goal.entity';

export class CompetencyDto {
  @IsEnum(CompetencyCategory)
  category: CompetencyCategory;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  selfRating?: number;

  @IsOptional()
  @IsString()
  selfComments?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  managerRating?: number;

  @IsOptional()
  @IsString()
  managerComments?: string;
}

export class UpdateCompetenciesDto {
  @ValidateNested({ each: true })
  @Type(() => CompetencyDto)
  @ArrayMinSize(1)
  competencies: CompetencyDto[];
} 