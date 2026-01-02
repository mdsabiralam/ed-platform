import { Module } from '@nestjs/common';
import { AiDoubtController } from './ai-doubt.controller';
import { AiDoubtService } from './ai-doubt.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AiDoubtController],
  providers: [AiDoubtService, PrismaService],
})
export class AiModule {}
