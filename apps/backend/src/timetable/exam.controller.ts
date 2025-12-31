import { Controller, Post, Put, Get, Body, Param, Delete, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExamService } from './exam.service';
import { DefineExamDto, CreateExamGroupDto, AssignExamGroupDto, GenerateAdmitCardDto } from './dto/exam.dto';

@Controller('api/academic/exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // 6.A.03: API to Define Exam
  @Post('define')
  async defineExam(@Body() dto: DefineExamDto) {
    return this.examService.defineExam(dto);
  }

  // 6.A.04: Create Exam Group
  @Post('group')
  async createExamGroup(@Body() dto: CreateExamGroupDto) {
    return this.examService.createExamGroup(dto);
  }

  // 6.A.04: Assign Exams to Group
  @Post('group/assign')
  async assignExamsToGroup(@Body() dto: AssignExamGroupDto) {
    return this.examService.assignExamsToGroup(dto);
  }

  // 6.A.05: Lock Exam
  @Put(':id/lock')
  async lockExam(@Param('id') id: string) {
    return this.examService.lockExam(id);
  }

  // 6.A.06: Publish Exam
  @Put(':id/publish')
  async publishExam(@Param('id') id: string) {
    return this.examService.publishExam(id);
  }

  // 6.A.06: Get Exams for Student
  @Get('student/:id')
  async getStudentExams(@Param('id') id: string) {
    return this.examService.getExamsForStudent(id);
  }

  // Extra: Delete Exam (Protected by lock)
  @Delete(':id')
  async deleteExam(@Param('id') id: string) {
    return this.examService.deleteExam(id);
  }

  // 6.A.08: Generate Admit Card PDF
  @Post('admit-card/generate')
  async generateAdmitCard(@Body() dto: GenerateAdmitCardDto, @Res() res: Response) {
    const pdfBytes = await this.examService.generateAdmitCard(dto);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="admit-card.pdf"',
    });
    res.send(Buffer.from(pdfBytes));
  }
}