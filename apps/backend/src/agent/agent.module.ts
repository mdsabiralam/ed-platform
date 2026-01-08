import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { GeminiAgentService } from './gemini-agent.service';
import { AssignmentModule } from '../assignment/assignment.module';
import { NotificationModule } from '../notifications/notification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, PrismaModule, AssignmentModule, NotificationModule],
  controllers: [AgentController],
  providers: [GeminiAgentService],
})
export class AgentModule {}
