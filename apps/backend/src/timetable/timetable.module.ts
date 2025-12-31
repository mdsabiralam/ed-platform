import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableProcessor } from './timetable.processor';
import { GeneticAlgorithmService } from './genetic-algorithm.service';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { MarksController } from './marks.controller';
import { MarksService } from './marks.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'timetable-generation',
    }),
  ],
  controllers: [TimetableController, ExamController, MarksController],
  providers: [TimetableService, TimetableProcessor, GeneticAlgorithmService, ExamService, MarksService],
})
export class TimetableModule {}
