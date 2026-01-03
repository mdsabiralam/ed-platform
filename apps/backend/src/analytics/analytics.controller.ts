import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('api')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/section/toppers')
  @ApiOperation({ summary: 'Get Top 3 students in a section for a specific exam term' })
  @ApiQuery({ name: 'sectionId', required: true, description: 'ID of the section' })
  @ApiQuery({ name: 'examTermId', required: true, description: 'ID of the exam term' })
  async getSectionToppers(
    @Query('sectionId') sectionId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.analyticsService.getSectionToppers(sectionId, examTermId);
  }

  @Get('academic/analytics/student/progress/:studentId')
  @ApiOperation({ summary: 'Get student academic progress (last 6 terms)' })
  @ApiParam({ name: 'studentId', required: true, description: 'ID of the student' })
  async getStudentProgress(@Param('studentId') studentId: string) {
    return this.analyticsService.getStudentProgress(studentId);
  }

  @Get('analytics/teacher/performance')
  @ApiOperation({ summary: 'Get teacher performance for a subject in a section' })
  @ApiQuery({ name: 'sectionId', required: true })
  @ApiQuery({ name: 'subjectId', required: true })
  @ApiQuery({ name: 'examTermId', required: true })
  async getTeacherPerformance(
    @Query('sectionId') sectionId: string,
    @Query('subjectId') subjectId: string,
    @Query('examTermId') examTermId: string,
  ) {
    return this.analyticsService.getTeacherPerformance(sectionId, subjectId, examTermId);
  }

  @Get('analytics/result-engagement')
  @ApiOperation({ summary: 'Get result engagement metrics (views vs published)' })
  @ApiQuery({ name: 'examTermId', required: true })
  async getResultEngagement(@Query('examTermId') examTermId: string) {
    return this.analyticsService.getResultEngagement(examTermId);
  }
}
