import { Module } from '@nestjs/common';
import { CurriculumModule } from './curriculum/curriculum.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [CurriculumModule, AnalyticsModule],
})
export class AcademicModule {}
