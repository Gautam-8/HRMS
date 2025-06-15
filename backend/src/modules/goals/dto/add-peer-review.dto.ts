import { IsString, IsNumber, Min, Max } from 'class-validator';

export class AddPeerReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  feedback: string;
} 