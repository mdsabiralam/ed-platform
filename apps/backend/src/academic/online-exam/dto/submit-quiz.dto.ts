import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  selectedOption: string;
}

export class SubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
