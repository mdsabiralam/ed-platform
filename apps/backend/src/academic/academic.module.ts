import { Module } from '@nestjs/common';
import { GradingController } from './controllers/grading.controller';
import { MarksController } from './controllers/marks.controller';
import { GradingService } from './services/grading.service';
import { ResultService } from './services/result.service';
import { MarksService } from './services/marks.service';
import { ResultController } from './controllers/result.controller';
import { MarksheetController } from './controllers/marksheet.controller';
import { ResultCalculationProcessor } from './queues/result-calculation.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { CalculationLogService } from './services/calculation-log.service';
import { SubjectAnalyticsService } from './services/subject-analytics.service';
import { FinanceService } from './services/finance-mock.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'result-calculation',
    }),
  ],
  controllers: [GradingController, MarksController, ResultController, MarksheetController],
  providers: [
    GradingService,
    ResultService,
    MarksService,
    ResultCalculationProcessor,
    CalculationLogService,
    SubjectAnalyticsService,
    FinanceService
  ],
  exports: [GradingService, ResultService, MarksService],
})
export class AcademicModule {}
