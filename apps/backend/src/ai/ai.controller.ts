import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('doubt')
  async solveDoubt(@Body('question') question: string) {
    return this.aiService.solveDoubt(question);
  }
}
