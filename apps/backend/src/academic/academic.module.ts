import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';
import { RoutineModule } from './routine/routine.module';
import { HomeworkModule } from './homework/homework.module';

@Module({
  imports: [RoutineModule, HomeworkModule],
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
})
export class AcademicModule {}
