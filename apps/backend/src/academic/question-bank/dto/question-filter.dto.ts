import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel, BloomsLevel } from './create-question.dto';

export class QuestionFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topicTag?: string;

  @ApiPropertyOptional({ enum: DifficultyLevel })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ enum: BloomsLevel })
  @IsOptional()
  @IsEnum(BloomsLevel)
  bloomsLevel?: BloomsLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectId?: string;
}
