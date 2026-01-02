import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { BroadsheetService } from './broadsheet.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Broadsheet')
@Controller('api/academic/analytics/broadsheet')
export class BroadsheetController {
  constructor(private readonly broadsheetService: BroadsheetService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export class broadsheet to Excel' })
  @ApiQuery({ name: 'classId', required: true })
  @ApiQuery({ name: 'examTermId', required: true })
  async exportBroadsheet(
    @Query('classId') classId: string,
    @Query('examTermId') examTermId: string,
    @Res() res: Response,
  ) {
    const workbook = await this.broadsheetService.generateBroadsheet(classId, examTermId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'broadsheet.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
