import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('section/toppers')
  @ApiOperation({ summary: 'Get top 3 students in a section for a specific term' })
  @ApiQuery({ name: 'sectionId', required: true })
  @ApiQuery({ name: 'examTermId', required: true })
  async getSectionToppers(
    @Query('sectionId') sectionId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.analyticsService.getSectionToppers(sectionId, examTermId);
  }
}
