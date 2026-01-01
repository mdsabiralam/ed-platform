import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExamPdfService } from './exam-pdf.service';
import { ExamRescheduledListener } from './listeners/exam-rescheduled.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  providers: [ExamService, ExamPdfService, ExamRescheduledListener],
  exports: [ExamService, ExamPdfService],
})
export class ExamModule {}
