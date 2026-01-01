import { IsDateString, IsNotEmpty, IsInt } from 'class-validator';

export class RescheduleExamDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsDateString()
  @IsNotEmpty()
  time: string;

  @IsInt()
  @IsNotEmpty()
  duration: number;
}
