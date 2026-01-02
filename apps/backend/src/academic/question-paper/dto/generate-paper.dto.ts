import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePaperDto {
  @ApiProperty({ description: 'The ID of the Question Blueprint' })
  @IsUUID()
  @IsNotEmpty()
  blueprintId: string;

  @ApiProperty({ description: 'The ID of the Class' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'List of Chapter IDs to include', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  chapterIds: string[];
}
