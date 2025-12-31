import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';
import { RoutineModule } from './routine/routine.module';
import { HomeworkModule } from './homework/homework.module';
import { ExamModule } from './exam/exam.module';
import { TimetableModule } from '../timetable/timetable.module';

@Module({
  imports: [RoutineModule, HomeworkModule, ExamModule, TimetableModule],
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
})
export class AcademicModule {}
