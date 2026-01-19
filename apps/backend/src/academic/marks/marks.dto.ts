import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class MarkRecordDto {
  @IsString()
  studentId: string;

  @IsString()
  examId: string;

  @IsString()
  subject: string;

  @IsNumber()
  marks: number;
}

export class BulkMarksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkRecordDto)
  records: MarkRecordDto[];
}
