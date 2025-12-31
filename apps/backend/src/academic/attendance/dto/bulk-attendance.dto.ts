import { IsArray, IsDateString, IsString } from 'class-validator';

export class BulkAttendanceDto {
  @IsArray()
  studentIds: string[];

  @IsString()
  status: string; // 'PRESENT', 'ABSENT'

  @IsDateString()
  date: string;
}
