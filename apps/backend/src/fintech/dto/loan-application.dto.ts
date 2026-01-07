import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class LoanApplicationDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  panNumber: string;

  // Simplified for DTO. Complex JSON in logic.
  @IsNotEmpty()
  incomeDetails: any;
}

export class DisbursementWebhookDto {
  @IsString()
  applicationId: string;

  @IsString()
  status: string; // SUCCESS, FAILED

  @IsString()
  transactionId: string;
}
