import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { ResultAccessGuard } from '../../common/guards/result-access.guard';
import { MarksheetGeneratorService } from './marksheet-generator.service';

@Controller('api/academic/marksheet')
export class MarksheetController {
  constructor(private readonly marksheetGeneratorService: MarksheetGeneratorService) {}

  @Get('pdf/:id')
  @UseGuards(ResultAccessGuard)
  async getMarksheetPdf(@Param('id') id: string, @Res() res: express.Response) {
    const stream = await this.marksheetGeneratorService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="marksheet.pdf"',
    });

    stream.pipe(res);
  }
}
