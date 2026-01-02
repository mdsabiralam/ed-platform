import { IsEnum, IsNotEmpty } from 'class-validator';
import { TrainingAttendanceStatus } from '@prisma/client';

export class UpdateAttendanceDto {
  @IsEnum(TrainingAttendanceStatus)
  @IsNotEmpty()
  status: TrainingAttendanceStatus;
}
