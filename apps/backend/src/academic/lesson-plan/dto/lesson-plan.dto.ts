import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { LessonPlanStatus } from '@prisma/client';

export class CreateLessonPlanDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsOptional()
  learningOutcomes?: string;

  @IsDateString()
  plannedDate: string;

  @IsString()
  @IsNotEmpty()
  routineEntryId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsOptional()
  chapterId?: string;

  @IsArray()
  @IsOptional()
  resourcesUrl?: any[];
}

export class UpdateLessonPlanStatusDto {
  @IsEnum(LessonPlanStatus)
  status: LessonPlanStatus;

  // Additional fields for DailyDiary
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @IsString()
  @IsOptional()
  contentCovered?: string;

  @IsString()
  @IsOptional()
  homeworkAssigned?: string;
}

export class CloneYearDto {
    @IsString()
    sourceYear: string;

    @IsString()
    targetYear: string;

    @IsDateString()
    targetStartDate: string;
}
