import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTicketDto {
  @ApiProperty({ example: 'Login Issue' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'I cannot login to the student portal.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: TicketPriority, example: 'HIGH' })
  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @ApiProperty({ example: 'UUID-OF-CATEGORY' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'https://storage.com/screenshot.png' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
