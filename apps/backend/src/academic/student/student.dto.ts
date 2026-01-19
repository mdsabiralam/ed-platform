import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateRemarkDto {
  @IsString()
  text: string;

  @IsString()
  teacherId: string;

  @IsOptional()
  @IsString() // Base64 or URL
  voiceData?: string;
}
