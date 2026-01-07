import { Module } from '@nestjs/common';
import { AiController } from './controllers/ai.controller';
import { AiProxyService } from './services/ai-proxy.service';

@Module({
  controllers: [AiController],
  providers: [AiProxyService],
})
export class AiModule {}
