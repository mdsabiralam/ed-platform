import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';
import { RoutineModule } from './routine/routine.module';

@Module({
  imports: [RoutineModule],
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
})
export class AcademicModule {}
