import { Controller, Post, Body, Get, Query, Req, Param } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TimetableService } from './timetable.service';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';

@Controller('academic/routine')
export class TimetableController {
  constructor(
    private readonly timetableService: TimetableService,
    @InjectQueue('timetable-generation') private readonly timetableQueue: Queue,
  ) {}

  @Get('student/:id')
  async getStudentRoutine(@Param('id') studentId: string) {
    return this.timetableService.getStudentRoutine(studentId);
  }

  @Get('teacher/:id')
  async getTeacherRoutine(@Param('id') teacherId: string) {
    return this.timetableService.getTeacherRoutine(teacherId);
  }

  @Get('filter')
  async getFilteredRoutine(
    @Req() req: any,
    @Query('classId') classId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('roomId') roomId?: string,
    @Query('day') day?: string,
  ) {
    return this.timetableService.findFiltered({
      classId,
      teacherId,
      subjectId,
      roomId,
      day,
      schoolId: req['tenantId'],
    });
  }

  @Post(':id/complete')
  async markRoutineComplete(@Param('id') id: string) {
    return this.timetableService.markComplete(id);
  }

  @Post('validate-config')
  validateConfig(@Body() createDto: GenerateTimetableDto) {
    return this.timetableService.validateRequest(createDto);
  }

  @Post('generate')
  async generate(@Body() createDto: GenerateTimetableDto) {
    const job = await this.timetableQueue.add('generate', createDto);
    return {
      success: true,
      jobId: job.id,
      status: 'queued',
    };
  }
}
