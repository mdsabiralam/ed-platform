import { IsString, IsOptional } from 'class-validator';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  board?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subject?: string;
}
