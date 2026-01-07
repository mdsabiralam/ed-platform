import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SlaMonitorService } from './sla/sla-monitor.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketController } from './ticket/ticket.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  providers: [SlaMonitorService],
  controllers: [TicketController],
  exports: [SlaMonitorService],
})
export class HelpdeskModule {}
