import { Module } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot() // Ensure ScheduleModule is imported if not global
  ],
  providers: [ReconciliationService],
})
export class ReconciliationModule {}
