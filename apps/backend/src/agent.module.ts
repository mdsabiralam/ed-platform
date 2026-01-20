import { Module } from '@nestjs/common';
import { GeminiAgentService } from './agent/gemini-agent.service';
import { AgentController } from './agent/agent.controller';
import { AssignmentService } from './assignment/assignment.service';
import { NotificationService } from './notifications/notification.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  providers: [GeminiAgentService, AssignmentService, NotificationService, PrismaService],
  controllers: [AgentController],
})
export class AgentModule {}
