import { Controller, Post, Body } from '@nestjs/common';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';

@Controller('academic/routine')
export class TimetableController {
  @Post('generate')
  generate(@Body() createDto: GenerateTimetableDto) {
    return {
      message: 'Timetable generation started',
      status: 'processing',
    };
  }
}
