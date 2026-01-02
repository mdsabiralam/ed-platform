import { IsString, IsEnum, IsInt, IsOptional, IsNotEmpty, IsJSON, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  LONG_ANSWER = 'LONG_ANSWER',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum BloomsLevel {
  REMEMBER = 'REMEMBER',
  UNDERSTAND = 'UNDERSTAND',
  APPLY = 'APPLY',
  ANALYZE = 'ANALYZE',
  EVALUATE = 'EVALUATE',
  CREATE = 'CREATE',
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  topicTag: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiProperty()
  @IsInt()
  marks: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string; // Supports HTML

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: BloomsLevel })
  @IsEnum(BloomsLevel)
  bloomsLevel: BloomsLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  options?: any; // JSON

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}
