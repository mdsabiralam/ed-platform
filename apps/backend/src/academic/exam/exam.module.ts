import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
