import { Controller, Get, Query } from '@nestjs/common';
import { SyllabusService } from './syllabus.service';

@Controller('academic/syllabus')
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @Get('status')
  getStatus(@Query('classId') classId: string, @Query('subjectId') subjectId: string) {
    return this.syllabusService.getStatus(classId, subjectId);
  }
}
