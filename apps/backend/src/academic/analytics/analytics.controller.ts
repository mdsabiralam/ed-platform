import { Controller, Get, Query, Res } from '@nestjs/common';
import { BroadsheetService } from './broadsheet/broadsheet.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import * as express from 'express';

@ApiTags('Academic Analytics')
@Controller('api/academic/analytics')
export class AnalyticsController {
  constructor(private readonly broadsheetService: BroadsheetService) {}

  @Get('broadsheet/export')
  @ApiOperation({ summary: 'Export broadsheet for a class and term as Excel' })
  @ApiQuery({ name: 'classId', required: true })
  @ApiQuery({ name: 'examTermId', required: true })
  async exportBroadsheet(
    @Query('classId') classId: string,
    @Query('examTermId') examTermId: string,
    @Res() res: express.Response,
  ) {
    const stream = await this.broadsheetService.generateBroadsheet(classId, examTermId);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="broadsheet-${classId}-${examTermId}.xlsx"`,
    });

    stream.pipe(res);
  }
}
