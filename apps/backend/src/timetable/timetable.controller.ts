import { Controller, Post, Body, Get, Query, Req, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TimetableService } from './timetable.service';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';

@ApiTags('Academic - Timetable')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID', required: true })
@Controller('academic/routine')
export class TimetableController {
  constructor(
    private readonly timetableService: TimetableService,
    @InjectQueue('timetable-generation') private readonly timetableQueue: Queue,
  ) {}

  @ApiOperation({ summary: 'Get student routine' })
  @Get('student/:id')
  async getStudentRoutine(@Param('id') studentId: string) {
    return this.timetableService.getStudentRoutine(studentId);
  }

  @ApiOperation({ summary: 'Get teacher routine' })
  @Get('teacher/:id')
  async getTeacherRoutine(@Param('id') teacherId: string) {
    return this.timetableService.getTeacherRoutine(teacherId);
  }

  @ApiOperation({ summary: 'Filter routine entries' })
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

  @ApiOperation({ summary: 'Mark routine entry as complete' })
  @Post(':id/complete')
  async markRoutineComplete(@Param('id') id: string) {
    return this.timetableService.markComplete(id);
  }

  @ApiOperation({ summary: 'Validate timetable config' })
  @Post('validate-config')
  validateConfig(@Body() createDto: GenerateTimetableDto) {
    return this.timetableService.validateRequest(createDto);
  }

  @ApiOperation({ summary: 'Generate timetable (Async)' })
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
