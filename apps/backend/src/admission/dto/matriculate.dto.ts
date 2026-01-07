import { IsString, IsNotEmpty } from 'class-validator';

export class MatriculateDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  targetClassId: string;

  @IsString()
  @IsNotEmpty()
  targetSectionId: string;
}
