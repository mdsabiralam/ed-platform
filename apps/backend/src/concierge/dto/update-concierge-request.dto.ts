import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class UpdateConciergeRequestDto {
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @IsString()
  @IsOptional()
  assignedStaffId?: string;
}
