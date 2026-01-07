import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketListener } from './ticket.listener';
import { SharedModule } from '../shared/shared.module';
import { PrismaModule } from '../prisma/prisma.module'; // Assuming this exists

@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [TicketController],
  providers: [TicketService, TicketListener],
})
export class HelpdeskModule {}
