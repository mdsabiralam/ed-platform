import { IsString, IsNotEmpty, IsDateString, IsInt, IsArray, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTrainingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsInt()
  @IsNotEmpty()
  durationHours: number;

  @IsString()
  @IsNotEmpty()
  resourcePerson: string;

  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @IsOptional()
  resourceUrls?: string[];

  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
