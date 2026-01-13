import { Module } from '@nestjs/common';
import { QuestionPaperService } from './question-paper.service';
import { QuestionPaperPdfService } from './question-paper-pdf.service';
import { QuestionPaperController } from './question-paper.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [QuestionPaperController],
  providers: [QuestionPaperService, QuestionPaperPdfService, PrismaService],
  exports: [QuestionPaperService],
})
export class QuestionPaperModule {}
