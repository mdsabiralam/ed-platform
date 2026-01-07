import { IsArray, IsNumber, IsString } from 'class-validator';

export class RollCallDto {
  @IsNumber()
  wardenLat: number;

  @IsNumber()
  wardenLng: number;

  @IsArray()
  @IsString({ each: true })
  studentList: string[]; // List of student IDs present
}
