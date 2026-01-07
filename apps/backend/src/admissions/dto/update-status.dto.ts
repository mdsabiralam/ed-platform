import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdmissionStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @ApiProperty({ enum: AdmissionStatus })
  @IsNotEmpty()
  @IsEnum(AdmissionStatus)
  newStatus: AdmissionStatus;

  @ApiProperty({ required: false, example: 'Rejection reason or general remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
