import { IsString, IsNotEmpty, IsNumber, IsBoolean, Min, IsOptional } from 'class-validator';

export class UpdateStudentMarkDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsNumber()
  @Min(0)
  theory: number;

  @IsNumber()
  @Min(0)
  practical: number;

  @IsBoolean()
  isAbsent: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}
