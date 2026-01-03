import { Module } from '@nestjs/common';
import { MarksheetController } from './marksheet/marksheet.controller';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { ResultService } from './results/result.service';
import { MarksModule } from './marks/marks.module';
import { FinanceModule } from '../finance/finance.module';
import { BroadsheetController } from './analytics/broadsheet/broadsheet.controller';
import { BroadsheetService } from './analytics/broadsheet/broadsheet.service';

@Module({
  imports: [MarksModule, FinanceModule],
  controllers: [MarksheetController, BroadsheetController],
  providers: [PdfGeneratorService, ResultService, BroadsheetService],
  exports: [ResultService, PdfGeneratorService, BroadsheetService],
})
export class AcademicModule {}
