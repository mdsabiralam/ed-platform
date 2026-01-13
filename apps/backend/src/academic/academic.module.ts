import { Module } from '@nestjs/common';
import { LearningResourceModule } from './learning-resource/learning-resource.module';

@Module({
  imports: [LearningResourceModule],
  exports: [LearningResourceModule],
})
export class AcademicModule {}
