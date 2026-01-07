import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class PublishRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsNotEmpty()
  classId: string; // To which class to publish
}
