import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { ExamScheduleController } from './exam-schedule.controller';
import { ExamScheduleService } from './exam-schedule.service';

@Module({
  controllers: [ExamController, ExamScheduleController],
  providers: [ExamService, ExamScheduleService],
  exports: [ExamService, ExamScheduleService],
})
export class ExamModule {}
