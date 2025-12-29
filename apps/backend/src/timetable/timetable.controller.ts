import { Controller, Post, Body } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';

@Controller('academic/routine')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post('validate-config')
  validateConfig(@Body() createDto: GenerateTimetableDto) {
    return this.timetableService.validateRequest(createDto);
  }
}
