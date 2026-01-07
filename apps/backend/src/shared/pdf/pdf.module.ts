import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
