import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsUUID } from 'class-validator';

export class SubmitFeedbackDto {
  @IsUUID()
  @IsNotEmpty()
  attendanceId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  score: number;

  @IsString()
  @IsOptional()
  comments?: string;
}
