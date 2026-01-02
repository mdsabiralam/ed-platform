import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('section/toppers')
  async getSectionToppers(
    @Query('sectionId') sectionId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.analyticsService.getSectionToppers(sectionId, examTermId);
  }
}
