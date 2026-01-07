import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdmissionSessionDto {
  @ApiProperty({ example: '2024-2025' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
