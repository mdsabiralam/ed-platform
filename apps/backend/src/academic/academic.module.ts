import { Module } from '@nestjs/common';
import { GradingController } from './controllers/grading.controller';
import { GradingService } from './services/grading.service';
import { ResultService } from './services/result.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GradingController],
  providers: [GradingService, ResultService],
  exports: [GradingService, ResultService],
})
export class AcademicModule {}
