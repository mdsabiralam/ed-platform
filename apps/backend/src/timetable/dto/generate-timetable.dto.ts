import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateTimetableDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  sectionId: string;
}
