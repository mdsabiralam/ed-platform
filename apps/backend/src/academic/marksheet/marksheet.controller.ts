import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { ResultAccessGuard } from '../../common/guards/result-access.guard';
import { Response } from 'express';

@Controller('api/academic/marksheet')
export class MarksheetController {

  @Get('pdf/:id')
  @UseGuards(ResultAccessGuard)
  async getMarksheetPdf(@Param('id') id: string, @Res() res: Response) {
    // If we reach here, the Guard passed (fees are clear).
    // In a real app, this would generate and stream PDF.
    return res.status(200).send('PDF Stream');
  }
}
