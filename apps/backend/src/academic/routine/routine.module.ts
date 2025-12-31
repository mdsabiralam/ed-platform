import { Module } from '@nestjs/common';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';
import { RoutineListener } from './listeners/routine.listener';

@Module({
  controllers: [RoutineController],
  providers: [RoutineService, RoutineListener],
  exports: [RoutineService],
})
export class RoutineModule {}
