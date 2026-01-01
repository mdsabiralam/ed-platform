import { Controller, Post, Get, Body, Query, Res, UseGuards, ConflictException } from '@nestjs/common';
import { Response } from 'express';
import { ExamService } from './exam.service';
import { ExamPdfService } from './exam-pdf.service';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { RescheduleExamDto } from './dto/reschedule-exam.dto';
import { Put, Param } from '@nestjs/common';

@Controller('academic/exam')
export class ExamController {
  constructor(
    private readonly examService: ExamService,
    private readonly examPdfService: ExamPdfService,
  ) {}

  @Get('schedule')
  async getSchedules(@Query('classId') classId: string) {
    return this.examService.getSchedules(classId);
  }

  @Get('room-allocation/pdf')
  async getRoomAllocationPdf(@Query('date') dateString: string, @Res() res: Response) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new ConflictException('Invalid date provided');
    }
    const buffer = await this.examPdfService.generateRoomAllocationChart(date);

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=room-allocation-${dateString}.pdf`,
        'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('schedule')
  async createSchedule(@Body() schedules: CreateExamScheduleDto[]) {
    // Validate that input is array? ClassValidator handles DTO validation but for array body?
    // NestJS ParseArrayPipe can be used, but standard @Body() might just give the JSON.
    // Assuming simple array input.
    if (!Array.isArray(schedules)) {
        throw new ConflictException('Input must be an array of schedules');
    }
    return this.examService.createSchedules(schedules);
  }

  @Put('schedule/:id')
  async rescheduleExam(@Param('id') id: string, @Body() dto: RescheduleExamDto) {
    return this.examService.rescheduleExam(id, dto);
  }
}
