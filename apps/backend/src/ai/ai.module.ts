import { Module } from '@nestjs/common';
import { AiDoubtController } from './ai-doubt.controller';
import { AiDoubtService } from './ai-doubt.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiDoubtController],
  providers: [AiDoubtService],
})
export class AiModule {}
