import { Module } from '@nestjs/common';
import { ConciergeService } from './concierge.service';
import { ConciergeController } from './concierge.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AssignmentModule } from '../assignment/assignment.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [PrismaModule, AssignmentModule, NotificationModule],
  controllers: [ConciergeController],
  providers: [ConciergeService],
  exports: [ConciergeService],
})
export class ConciergeModule {}
