import { IsString, IsNotEmpty, IsNumber, IsPositive, IsDateString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class DefineExamDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  termId: string;

  @IsString()
  @IsNotEmpty()
  typeId: string;

  @IsNumber()
  @IsPositive()
  maxMarks: number;

  @IsDateString()
  examDate: string;
}

export class AssignExamGroupDto {
  @IsString()
  @IsNotEmpty()
  examGroupId: string;

  @IsArray()
  @IsString({ each: true })
  examIds: string[];
}

export class CreateExamGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

export class GenerateAdmitCardDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  examGroupId: string;

  @IsOptional()
  @IsBoolean()
  override_pass?: boolean;
}