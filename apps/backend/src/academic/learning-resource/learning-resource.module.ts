import { Module } from '@nestjs/common';
import { LearningResourceService } from './learning-resource.service';
import { LearningResourceController } from './learning-resource.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LearningResourceController],
  providers: [LearningResourceService],
  exports: [LearningResourceService],
})
export class LearningResourceModule {}
