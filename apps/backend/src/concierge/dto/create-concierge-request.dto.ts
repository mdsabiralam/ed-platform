import { IsString, IsOptional } from 'class-validator';

export class CreateConciergeRequestDto {
  @IsString()
  teacherId: string;

  @IsString()
  subject: string;

  @IsString()
  instructions: string;

  @IsString()
  @IsOptional()
  rawImageUrl?: string;
}
