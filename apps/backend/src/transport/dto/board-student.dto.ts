import { IsString, IsNumber, IsOptional } from 'class-validator';

export class BoardStudentDto {
  @IsString()
  tripId: string;

  @IsString()
  studentId: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;
}
