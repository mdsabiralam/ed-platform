import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableProcessor } from './timetable.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'timetable-generation',
    }),
  ],
  controllers: [TimetableController],
  providers: [TimetableService, TimetableProcessor],
})
export class TimetableModule {}
