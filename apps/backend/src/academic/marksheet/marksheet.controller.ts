import { Controller, Get, Param, Res } from '@nestjs/common';
import { MarksheetService } from './marksheet.service';
import { Response } from 'express';

@Controller('api/academic/marksheet')
export class MarksheetController {
  constructor(private readonly marksheetService: MarksheetService) {}

  @Get('pdf/:id')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.marksheetService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
