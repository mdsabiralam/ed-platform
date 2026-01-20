import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // শিডিউলিং মডিউল ইম্পোর্ট
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsScheduler } from './events.scheduler'; // শিডিউলার সার্ভিস ইম্পোর্ট
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(), // শিডিউলিং এনাবল করা হলো
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsScheduler, // শিডিউলার প্রোভাইডার হিসেবে রেজিস্ট্রেশন
  ],
  exports: [EventsService],
})
export class EventsModule {}