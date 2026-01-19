import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('lesson-plan')
  async generateLessonPlan(@Body('topic') topic: string) {
    return this.aiService.generateLessonPlan(topic);
  }
}
