import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CampaignController } from './controllers/campaign.controller';
import { AudienceService } from './services/audience.service';
import { BroadcastService } from './services/broadcast.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { BroadcastProcessor } from './processors/broadcast.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'broadcast_queue',
      // Rate limiting: 50 jobs per second (1000ms)
      limiter: {
        max: 50,
        duration: 1000,
      },
    }),
  ],
  controllers: [CampaignController],
  providers: [
    AudienceService,
    BroadcastService,
    NotificationTemplateService,
    BroadcastProcessor,
  ],
  exports: [BroadcastService],
})
export class CommunicationModule {}
