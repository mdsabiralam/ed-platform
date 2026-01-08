import { Controller, Post, Body } from '@nestjs/common';
import { MarksService } from './marks.service';
import { UpdateStudentMarkDto } from './dto/marks.dto';

@Controller('api/academic/marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post('update')
  async updateMark(@Body() dto: UpdateStudentMarkDto) {
    return this.marksService.updateMark(dto);
  }
}