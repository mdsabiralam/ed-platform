import { Module } from '@nestjs/common';
import { LessonPlanService } from './lesson-plan.service';
import { LessonPlanController, PrincipalController } from './lesson-plan.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LessonPlanController, PrincipalController],
  providers: [LessonPlanService],
})
export class LessonPlanModule {}
