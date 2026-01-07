import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class GradeAssignmentDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsNotEmpty()
  submissionId: string;

  @IsUrl()
  imageUrl: string;

  @IsString()
  referenceAnswer: string;
}
