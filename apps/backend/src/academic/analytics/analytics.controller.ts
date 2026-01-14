import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SyllabusReportService } from './syllabus-report.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LagReportItemDto } from './dto/lag-report-item.dto';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@ApiTags('Academic Analytics')
@Controller('academic/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly syllabusReportService: SyllabusReportService,
  ) {}

  @Get('syllabus-report/pdf')
  @ApiOperation({ summary: 'Generate Syllabus Completion Report PDF (7.B.09)' })
  async getSyllabusReportPdf(
    @Req() req: any,
    @Query('classId') classId: string,
    @Query('subjectId') subjectId: string,
    @Res() res: any,
  ) {
    const tenantId = req.user?.tenantId;
    const pdfBuffer = await this.syllabusReportService.generateSyllabusReport(tenantId, classId, subjectId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=syllabus-report-${classId}-${subjectId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

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
