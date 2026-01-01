import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurriculumPlanDto {
  @ApiProperty({ example: 'CLASS-UUID', description: 'Class ID' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 'SUBJECT-UUID', description: 'Subject ID' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'SESSION-UUID', description: 'Academic Year ID' })
  @IsString()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ example: '1.0', description: 'Version of the syllabus', required: false })
  @IsString()
  @IsOptional()
  version?: string;
}

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsNumber()
  @IsNotEmpty()
  chapterNumber: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  targetCompletionDate?: Date;
}

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  chapterId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  estimatedHours: number;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}
