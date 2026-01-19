import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('class-performance/:examId')
  async getClassPerformance(@Param('examId') examId: string) {
    return this.analyticsService.getClassPerformance(examId);
  }
}
