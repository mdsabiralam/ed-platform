import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { ResultModule } from '../academic/results/result.module';

@Module({
  imports: [ResultModule],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
