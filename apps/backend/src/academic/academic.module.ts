import { Module } from '@nestjs/common';
import { OnlineExamModule } from './online-exam/online-exam.module';

@Module({
  imports: [OnlineExamModule],
  exports: [OnlineExamModule],
})
export class AcademicModule {}
