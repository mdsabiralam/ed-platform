import { Module } from '@nestjs/common';
import { MarksheetController } from './marksheet.controller';
import { MarksheetGeneratorService } from './marksheet-generator.service';
import { FinanceModule } from '../../finance/finance.module';
import { LibraryModule } from '../../library/library.module';

@Module({
  imports: [FinanceModule, LibraryModule],
  controllers: [MarksheetController],
  providers: [MarksheetGeneratorService],
})
export class AcademicMarksheetModule {}
