import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { MarksService } from './marks.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Academic - Marks')
@Controller('academic/marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @ApiOperation({ summary: 'Update student marks' })
  @Post('update')
  async updateMarks(@Req() req: any, @Body() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.marksService.updateMarks(tenantId, body);
  }

  @ApiOperation({ summary: 'Bulk upload marks' })
  @Post('bulk-upload')
  async bulkUpload(@Req() req: any, @Body() body: any[]) {
    const tenantId = req.headers['x-tenant-id'];
    return this.marksService.bulkUploadMarks(tenantId, body);
  }
}
