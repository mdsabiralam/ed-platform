import { Controller, Post, Get, Body, Query, UseGuards, ConflictException } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';

@Controller('academic/exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('schedule')
  async getSchedules(@Query('classId') classId: string) {
    return this.examService.getSchedules(classId);
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
}
