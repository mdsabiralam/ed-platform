import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { IsString, IsNotEmpty } from 'class-validator';

export class AskDoubtDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}

@ApiTags('AI Doubt Solver')
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('doubt')
  @ApiOperation({ summary: 'Ask a doubt and get relevant context from textbooks' })
  @ApiBody({ type: AskDoubtDto })
  async askDoubt(@Body() dto: AskDoubtDto) {
    return this.aiService.solveDoubt(dto.studentId, dto.subjectId, dto.question);
  }
}
