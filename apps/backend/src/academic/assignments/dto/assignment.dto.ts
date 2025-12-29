import { IsString, IsNotEmpty, IsDateString, IsOptional, IsInt, IsArray, IsEnum, IsBoolean } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsInt()
  maxMarks: number;

  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsArray()
  @IsOptional()
  attachmentUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class SubmitAssignmentDto {
    @IsString()
    @IsNotEmpty()
    studentId: string;

    @IsArray()
    @IsOptional()
    fileUrls: string[];
}
