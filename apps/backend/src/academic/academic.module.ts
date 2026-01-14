import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';
import { RoutineModule } from './routine/routine.module';
import { HomeworkModule } from './homework/homework.module';
import { ExamModule } from './exam/exam.module';
import { TimetableModule } from '../timetable/timetable.module';
import { MarksModule } from './marks/marks.module';
import { ResultModule } from './result/result.module';
import { MarksheetModule } from './marksheet/marksheet.module';

@Module({
  imports: [
    RoutineModule,
    HomeworkModule,
    ExamModule,
    TimetableModule,
    MarksModule,
    ResultModule,
    MarksheetModule
  ],
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
})
export class AcademicModule {}
