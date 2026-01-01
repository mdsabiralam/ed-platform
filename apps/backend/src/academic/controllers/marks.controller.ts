import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { MarksService, UpdateMarkDto } from '../services/marks.service';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

@ApiTags('Academic - Marks')
@Controller('api/academic/marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post('update')
  @ApiOperation({ summary: 'Update single student mark' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async updateMark(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: UpdateMarkDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.marksService.updateMark(tenantId, dto);
  }

  @Post('bulk-upload')
  @ApiOperation({ summary: 'Bulk upload marks' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async bulkUpload(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: UpdateMarkDto[]
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    if (!Array.isArray(body)) throw new BadRequestException('Input must be an array');
    return this.marksService.bulkUploadMarks(tenantId, body);
  }
}
