import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AiDoubtService } from './ai-doubt.service';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { AiRateLimitGuard } from '../common/guards/ai-rate-limit.guard';

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

export class FeedbackDto {
  @IsString()
  @IsNotEmpty()
  interactionId: string;

  @IsBoolean()
  @IsNotEmpty()
  isHelpful: boolean;
}

@ApiTags('AI Doubt Solver')
@Controller('api/ai')
export class AiDoubtController {
  constructor(private readonly aiDoubtService: AiDoubtService) {}

  @Post('doubt')
  @UseGuards(AiRateLimitGuard)
  @ApiOperation({ summary: 'Ask a doubt and get relevant context from textbooks' })
  @ApiBody({ type: AskDoubtDto })
  async askDoubt(@Body() dto: AskDoubtDto) {
    return this.aiDoubtService.solveDoubt(dto.studentId, dto.subjectId, dto.question);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit feedback for an AI interaction' })
  @ApiBody({ type: FeedbackDto })
  async submitFeedback(@Body() dto: FeedbackDto) {
    return this.aiDoubtService.submitFeedback(dto.interactionId, dto.isHelpful);
  }
}
