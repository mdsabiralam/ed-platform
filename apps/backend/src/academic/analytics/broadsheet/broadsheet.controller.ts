
import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { BroadsheetService } from './broadsheet.service';

@ApiTags('Academic - Analytics')
@Controller('api/academic/analytics/broadsheet')
export class BroadsheetController {
  constructor(private readonly broadsheetService: BroadsheetService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export class broadsheet as Excel' })
  @ApiQuery({ name: 'classId', required: true })
  @ApiBearerAuth()
  async exportBroadsheet(@Query('classId') classId: string, @Res() res: Response) {
      if (!classId) throw new BadRequestException('Class ID is required');
      await this.broadsheetService.generateClassBroadsheet(classId, res);
  }
}
