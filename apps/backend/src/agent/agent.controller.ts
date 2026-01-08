import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { GeminiAgentService } from './gemini-agent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClsService } from 'nestjs-cls';

@Controller('agent')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(
    private readonly agentService: GeminiAgentService,
    private readonly cls: ClsService
  ) {}

  @Post('query')
  async query(@Body('query') query: string) {
    const instituteId = this.cls.get('instituteId');
    return this.agentService.processQuery(query, instituteId);
  }
}
