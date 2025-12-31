import { Controller, Post, Put, Get, Body, Req, Param, BadRequestException, Res } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Academic - Exam')
@Controller('academic/exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @ApiOperation({ summary: 'Define a new exam' })
  @ApiResponse({ status: 201, description: 'Exam created successfully.' })
  @Post('define')
  async defineExam(@Req() req: any, @Body() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant ID missing');
    return this.examService.defineExam(tenantId, body);
  }

  @ApiOperation({ summary: 'Lock an exam to prevent changes' })
  @Put(':id/lock')
  async lockExam(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.headers['x-tenant-id'];
    return this.examService.lockExam(id, tenantId);
  }

  @ApiOperation({ summary: 'Publish an exam for students' })
  @Put(':id/publish')
  async publishExam(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.headers['x-tenant-id'];
    return this.examService.publishExam(id, tenantId);
  }

  @ApiOperation({ summary: 'Get published exams for a student' })
  @Get('student/:studentId')
  async getStudentExams(@Req() req: any, @Param('studentId') studentId: string) {
    const tenantId = req.headers['x-tenant-id'];
    return this.examService.getExamsForStudent(tenantId, studentId);
  }

  @ApiOperation({ summary: 'Generate Admit Card PDF' })
  @Post('admit-card/generate')
  async generateAdmitCard(@Req() req: any, @Body() body: { studentId: string; examGroupId: string }, @Res() res: any) {
    const tenantId = req.headers['x-tenant-id'];
    const pdfBuffer = await this.examService.generateAdmitCard(tenantId, body.studentId, body.examGroupId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=admit-card.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}
