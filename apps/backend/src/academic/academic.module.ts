import { Module } from '@nestjs/common';
import { GradingController } from './controllers/grading.controller';
import { MarksController } from './controllers/marks.controller';
import { GradingService } from './services/grading.service';
import { ResultService } from './services/result.service';
import { MarksService } from './services/marks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GradingController, MarksController],
  providers: [GradingService, ResultService, MarksService],
  exports: [GradingService, ResultService, MarksService],
})
export class AcademicModule {}
