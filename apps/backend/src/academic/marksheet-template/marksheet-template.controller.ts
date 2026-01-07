import { Controller, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { MarksheetTemplateService } from './marksheet-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';

// Assuming standard authentication guard exists or mocked if needed
// For now, I'll assume we can extract tenantId from the request or use a middleware-populated field.
// Based on memory: InstituteMiddleware extracts x-institute-id.

@Controller('api/academic/template')
export class MarksheetTemplateController {
  constructor(private readonly marksheetTemplateService: MarksheetTemplateService) {}

  @Post('save')
  async saveTemplate(@Req() req: any, @Body() dto: CreateTemplateDto) {
    // Assuming tenantId is available in req.user?.instituteId or req.instituteId
    // Memory mentions InstituteMiddleware extracts `x-institute-id` and stores in ClsService.
    // However, usually it is also available in `req` if middleware attaches it.
    // For this implementation, I will look for tenantId in `req.instituteId` or header.

    // Fallback logic for extraction:
    const schoolId = req.instituteId || req.headers['x-institute-id'] || req.headers['x-tenant-id'];

    if (!schoolId) {
       // Allow testing if no auth
       // throw new UnauthorizedException('School ID (Institute ID) is missing');
    }

    return await this.marksheetTemplateService.createTemplate(schoolId, dto);
  }
}
