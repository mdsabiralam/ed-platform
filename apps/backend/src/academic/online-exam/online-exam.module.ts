import { Module } from '@nestjs/common';
import { OnlineExamService } from './online-exam.service';
import { OnlineExamController } from './online-exam.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnlineExamController],
  providers: [OnlineExamService],
  exports: [OnlineExamService],
})
export class OnlineExamModule {}
