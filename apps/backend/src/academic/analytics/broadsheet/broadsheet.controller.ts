import { Controller, Get, Query, Res } from '@nestjs/common';
import { BroadsheetService } from './broadsheet.service';
import { Response } from 'express';

@Controller('api/academic/analytics/broadsheet')
export class BroadsheetController {
  constructor(private readonly broadsheetService: BroadsheetService) {}

  @Get('export')
  async exportBroadsheet(@Query('sectionId') sectionId: string, @Res() res: Response) {
    const buffer = await this.broadsheetService.generateBroadsheet(sectionId);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=broadsheet.xlsx`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
