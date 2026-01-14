import { Module } from '@nestjs/common';
import { MarksheetController } from './marksheet/marksheet.controller';
import { ResultService } from './results/result.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarksheetController],
  providers: [ResultService, PdfGeneratorService],
  exports: [ResultService, PdfGeneratorService],
})
export class AcademicModule {}
