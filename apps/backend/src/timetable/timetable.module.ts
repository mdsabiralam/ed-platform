import { Module } from '@nestjs/common';
import { GeneticAlgorithmService } from './genetic-algorithm.service';

@Module({
  providers: [GeneticAlgorithmService],
  exports: [GeneticAlgorithmService],
})
export class TimetableModule {}
