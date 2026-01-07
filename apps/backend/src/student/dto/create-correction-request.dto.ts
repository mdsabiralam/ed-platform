import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateCorrectionRequestDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  fieldName: string; // 'firstName', 'lastName', 'dob'

  @IsString()
  @IsNotEmpty()
  newValue: string;

  @IsString()
  @IsOptional()
  oldValue?: string;
}

export class ApproveCorrectionRequestDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
