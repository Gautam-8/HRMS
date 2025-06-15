import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @IsNumber()
  @IsOptional()
  rating?: number;
} 