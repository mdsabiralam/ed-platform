import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('academic/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('training-impact/:trainingId')
  async getTrainingImpact(@Param('trainingId') trainingId: string) {
    return this.analyticsService.getTrainingImpact(trainingId);
  }
}
