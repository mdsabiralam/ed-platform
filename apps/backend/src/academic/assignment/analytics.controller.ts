import { Controller, Get, Query } from '@nestjs/common';
import { AssignmentAnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Academic - Analytics')
@Controller('academic/analytics')
export class AssignmentAnalyticsController {
  constructor(private readonly analyticsService: AssignmentAnalyticsService) {}

  @Get('homework-compliance')
  @ApiOperation({ summary: 'Get list of students with low homework compliance' })
  @ApiQuery({ name: 'classId', required: true })
  @ApiQuery({ name: 'sectionId', required: false })
  async getComplianceReport(
    @Query('classId') classId: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.analyticsService.getHomeworkCompliance(classId, sectionId);
  }
}
