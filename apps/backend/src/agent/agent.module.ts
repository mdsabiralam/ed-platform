import { Module } from '@nestjs/common';
import { GeminiAgentService } from './gemini-agent.service';
import { AgentController } from './agent.controller';

@Module({
  providers: [GeminiAgentService],
  controllers: [AgentController],
})
export class AgentModule {}
