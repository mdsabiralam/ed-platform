import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class AssignHomeworkDto {
  @IsString()
  classId: string;

  @IsString()
  subjectId: string;

  @IsString()
  teacherId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate: string;
}

export class SubmitHomeworkDto {
  @IsString()
  homeworkId: string;

  @IsString()
  studentId: string;

  @IsString()
  fileUrl: string;
}

export class GradeHomeworkDto {
  @IsString()
  submissionId: string;

  @IsInt()
  grade: number;
}
