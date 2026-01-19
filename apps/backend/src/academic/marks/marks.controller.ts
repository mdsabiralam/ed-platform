import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MarksService } from './marks.service';
import { BulkMarksDto } from './marks.dto';

@Controller('academic/marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post('bulk')
  async recordBulk(@Body() dto: BulkMarksDto) {
    try {
        return await this.marksService.recordBulk(dto);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }
}
