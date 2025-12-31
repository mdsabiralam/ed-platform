import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';
import { RoutineModule } from './routine/routine.module';
import { HomeworkModule } from './homework/homework.module';
import { ExamModule } from './exam/exam.module';

@Module({
  imports: [RoutineModule, HomeworkModule, ExamModule],
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
})
export class AcademicModule {}
