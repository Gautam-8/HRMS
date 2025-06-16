import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDocumentDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  docLabel: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  link?: string;
} 