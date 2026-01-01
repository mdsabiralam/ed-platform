import { Module } from '@nestjs/common';
import { GradingController } from './controllers/grading.controller';
import { GradingService } from './services/grading.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GradingController],
  providers: [GradingService],
  exports: [GradingService],
})
export class AcademicModule {}
