import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/section/toppers')
  async getSectionToppers(
    @Query('sectionId') sectionId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.analyticsService.getSectionToppers(sectionId, examTermId);
  }

  @Get('academic/analytics/student/progress/:studentId')
  async getStudentProgress(@Param('studentId') studentId: string) {
    return this.analyticsService.getStudentProgress(studentId);
  }
}
