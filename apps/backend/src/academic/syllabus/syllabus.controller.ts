import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { SyllabusService } from './syllabus.service';

@ApiTags('Academic - Syllabus')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant ID', required: true })
@Controller('academic/syllabus')
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @ApiOperation({ summary: 'Get syllabus status' })
  @Get('status')
  getStatus(@Query('classId') classId: string, @Query('subjectId') subjectId: string) {
    return this.syllabusService.getStatus(classId, subjectId);
  }
}
