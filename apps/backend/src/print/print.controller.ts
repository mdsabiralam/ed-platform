import { Controller, Post, Param, Body, Res, Req, BadRequestException } from '@nestjs/common';
import { PrintService } from './print.service';
import { Response } from 'express';

@Controller('api/print')
export class PrintController {
  constructor(private readonly printService: PrintService) {}

  @Post('generate-ids')
  async generateIdCards(@Req() req: any, @Body() body: { students: any[] }) {
    // Assume tenantId from user context
    const tenantId = req.user?.tenantId || req.user?.instituteId || 'default-tenant';
    return this.printService.generateIdCardPdf(tenantId, body.students);
  }

  @Post('approve/:id')
  async approveJob(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || 'mock-admin-id';
    return this.printService.approveJob(id, userId);
  }
}
