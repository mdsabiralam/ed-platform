import { Module } from '@nestjs/common';
import { MarksheetController } from './marksheet/marksheet.controller';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { ResultService } from './results/result.service';
import { MarksModule } from './marks/marks.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [MarksModule, FinanceModule],
  controllers: [MarksheetController],
  providers: [PdfGeneratorService, ResultService],
  exports: [ResultService, PdfGeneratorService],
})
export class AcademicModule {}
