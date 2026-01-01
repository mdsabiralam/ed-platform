import { IsString, IsInt, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateExamScheduleDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO Date string (YYYY-MM-DD)

  @IsDateString()
  @IsNotEmpty()
  time: string; // ISO Date string or Time string? "time" usually means HH:mm or full ISO.
                // I will assume full ISO for simplicity in parsing, or handle conversion.
                // Prompt says "time".
                // Logic: "date" and "time".
                // If I get "2024-10-27" and "10:00", I construct Date object.
                // If I get ISO string "2024-10-27T10:00:00Z", it's easier.
                // Given `checkScheduleConflict` takes `Date` objects, I'll prefer ISO.
                // But let's support separate strings if needed.
                // I'll stick to ISO string for "time" (representing start DateTime) to be safe,
                // or assume `time` is just time of day and merge with `date`.

  @IsInt()
  @IsNotEmpty()
  duration: number; // in minutes
}
