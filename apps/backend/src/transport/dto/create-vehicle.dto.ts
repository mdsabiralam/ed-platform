import { IsString, IsInt, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  regNumber: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsString()
  model: string;

  @IsDateString()
  insuranceExpiry: string;

  @IsDateString()
  fitnessCertExpiry: string;
}
