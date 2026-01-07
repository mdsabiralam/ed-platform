import { IsNotEmpty, IsOptional, IsString, IsObject, IsDateString } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  school_id: string; // tenantId

  @IsOptional()
  @IsObject()
  personal_details?: any;

  @IsOptional()
  @IsObject()
  guardian_details?: any;

  @IsOptional()
  @IsObject()
  previous_school_history?: any;

  @IsOptional()
  @IsString()
  status?: 'Draft' | 'Submitted';

  @IsNotEmpty()
  @IsString()
  class_id: string;
}
