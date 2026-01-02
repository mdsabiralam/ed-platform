import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LagReportItemDto } from './dto/lag-report-item.dto';

@ApiTags('Academic Analytics')
@Controller('academic/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('lag-report')
  @ApiOperation({ summary: 'Get Syllabus Lag Report (> 10 days) for Principal' })
  @ApiResponse({ status: 200, type: [LagReportItemDto] })
  async getLagReport(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.analyticsService.getSyllabusLagReport(tenantId);
  }

  @Get('sections-comparison')
  @ApiOperation({ summary: 'Compare Parallel Sections Progress (7.B.08)' })
  async compareSections(
    @Req() req: any,
    @Query('classId') classId: string,
    @Query('subjectId') subjectId: string,
  ) {
    const tenantId = req.user?.tenantId;
    return this.analyticsService.compareSections(tenantId, classId, subjectId);
  }
}
