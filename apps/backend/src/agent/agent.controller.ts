import { Controller, Post, Body } from '@nestjs/common';
import { GeminiAgentService } from './gemini-agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: GeminiAgentService) {}

  @Post('generate')
  generate(@Body('instructions') instructions: string) {
    return this.agentService.generateContent(instructions);
  }
}
