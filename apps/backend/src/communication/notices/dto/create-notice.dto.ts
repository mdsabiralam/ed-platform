import { IsBoolean, IsDateString, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @IsObject()
  @IsNotEmpty()
  targetAudience: Record<string, any>;
}
