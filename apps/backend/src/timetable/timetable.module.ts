import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableProcessor } from './timetable.processor';
import { GeneticAlgorithmService } from './genetic-algorithm.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'timetable-generation',
    }),
  ],
  controllers: [TimetableController],
  providers: [TimetableService, TimetableProcessor, GeneticAlgorithmService],
})
export class TimetableModule {}
