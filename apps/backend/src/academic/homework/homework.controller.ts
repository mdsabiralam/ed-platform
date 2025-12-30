import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Homework')
@Controller('academic/homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @ApiOperation({ summary: 'Assign homework to a section' })
  @ApiResponse({ status: 201, description: 'Homework assigned successfully.' })
  @Post('assign')
  async assignHomework(@Req() req: any, @Body() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID missing');
    return this.homeworkService.assignHomework(tenantId, body);
  }

  @ApiOperation({ summary: 'Submit homework as a student' })
  @ApiResponse({ status: 201, description: 'Homework submitted successfully.' })
  @Post('submit')
  async submitHomework(@Body() body: { studentId: string; homeworkId: string; url: string }) {
    return this.homeworkService.submitHomework(body.studentId, body.homeworkId, body.url);
  }

  @ApiOperation({ summary: 'Grade a homework submission' })
  @ApiResponse({ status: 200, description: 'Homework graded successfully.' })
  @Post('grade')
  async gradeHomework(@Body() body: { homeworkId: string; studentId: string; grade: string; feedback?: string }) {
    return this.homeworkService.gradeHomework(body.homeworkId, body.studentId, body.grade, body.feedback);
  }
}
