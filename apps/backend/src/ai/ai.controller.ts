import { Controller, Post, Body, Get } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('test-connection')
  async testConnection() {
    return this.aiService.testConnection();
  }

  @Post('process')
  async process(@Body('data') data: string) {
    return this.aiService.processData(data);
  }
}
