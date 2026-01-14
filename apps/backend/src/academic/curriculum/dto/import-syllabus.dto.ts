import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImportSyllabusDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ example: 'CLASS-UUID', description: 'Class ID' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 'SUBJECT-UUID', description: 'Subject ID' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: '2024-2025', description: 'Academic Year' })
  @IsString()
  @IsNotEmpty()
  academicYear: string;
}
