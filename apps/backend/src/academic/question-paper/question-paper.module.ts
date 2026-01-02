import { Module } from '@nestjs/common';
import { QuestionPaperService } from './question-paper.service';
import { QuestionPaperController } from './question-paper.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [QuestionPaperController],
  providers: [QuestionPaperService, PrismaService],
  exports: [QuestionPaperService],
})
export class QuestionPaperModule {}
