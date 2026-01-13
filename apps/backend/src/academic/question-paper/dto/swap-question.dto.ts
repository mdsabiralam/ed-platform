import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwapQuestionDto {
  @ApiProperty({ description: 'The ID of the question to swap out' })
  @IsUUID()
  @IsNotEmpty()
  currentQuestionId: string;

  @ApiProperty({ description: 'The ID of the Class (for duplicate checking context)' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;
}
