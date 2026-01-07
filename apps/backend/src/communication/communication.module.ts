import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './controllers/campaign.controller';
import { AudienceService } from './services/audience.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { BroadcastProcessor } from './processors/broadcast.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'broadcast_queue',
    }),
  ],
  controllers: [CommunicationController],
  providers: [
    CommunicationService,
    AudienceService,
    NotificationTemplateService,
    BroadcastProcessor,
  ],
  exports: [CommunicationService],
})
export class CommunicationModule {}
