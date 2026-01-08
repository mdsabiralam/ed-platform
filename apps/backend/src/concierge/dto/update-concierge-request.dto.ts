import { PartialType } from '@nestjs/swagger';
import { CreateConciergeRequestDto } from './create-concierge-request.dto';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateConciergeRequestDto extends PartialType(CreateConciergeRequestDto) {
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}
