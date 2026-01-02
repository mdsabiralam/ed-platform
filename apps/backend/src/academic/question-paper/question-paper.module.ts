import { Module } from '@nestjs/common';
import { QuestionPaperService } from './question-paper.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  providers: [QuestionPaperService, PrismaService],
  exports: [QuestionPaperService],
})
export class QuestionPaperModule {}
