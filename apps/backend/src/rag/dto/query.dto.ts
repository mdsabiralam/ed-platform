import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({ example: 'student-uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 'What is Newtons 3rd Law?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: 'subject-uuid' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;
}

export class IngestDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    subjectId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    filePath: string;
}
