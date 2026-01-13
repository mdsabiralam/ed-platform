import { IsString, IsNotEmpty, IsNumber, IsUUID, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';

class BlueprintStructureItemDto {
  @ApiProperty({ enum: QuestionType })
  @IsString()
  @IsNotEmpty()
  type: QuestionType;

  @ApiProperty()
  @IsNumber()
  count: number;

  @ApiProperty()
  @IsNumber()
  marks: number;
}

class DifficultyDistributionDto {
  @ApiProperty()
  @IsNumber()
  EASY: number;

  @ApiProperty()
  @IsNumber()
  MEDIUM: number;

  @ApiProperty()
  @IsNumber()
  HARD: number;
}

export class CreateBlueprintDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty()
  @IsNumber()
  totalMarks: number;

  @ApiProperty()
  @IsNumber()
  durationMinutes: number;

  @ApiProperty({ type: [BlueprintStructureItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlueprintStructureItemDto)
  structure: BlueprintStructureItemDto[];

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => DifficultyDistributionDto)
  difficultyDistribution: DifficultyDistributionDto;
}
