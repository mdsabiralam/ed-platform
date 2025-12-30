import { Controller, Post, Body, Get, Query } from '@nestjs/common';
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

  @Get('filter')
  async getFilteredRoutine(
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
    });
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
