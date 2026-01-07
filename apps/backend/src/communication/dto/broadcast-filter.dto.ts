import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class BroadcastFilterDto {
  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsBoolean()
  feeDefaulter?: boolean;
}
