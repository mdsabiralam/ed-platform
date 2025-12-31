import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { MarksheetService } from './marksheet.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Academic - Marksheet')
@Controller('academic/marksheet')
export class MarksheetController {
  constructor(private readonly marksheetService: MarksheetService) {}

  @ApiOperation({ summary: 'Stream Marksheet PDF' })
  @Get('pdf/:id')
  async getMarksheetPdf(@Req() req: any, @Param('id') studentId: string, @Res() res: any) {
    const tenantId = req.headers['x-tenant-id'];
    const pdfBuffer = await this.marksheetService.generateMarksheetPdf(studentId, tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=marksheet.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}
