import { Controller, Post, Body } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('opd')
  async logOpd(@Body() body: { tenantId: string; studentId: string; symptom: string; treatment?: string; nurseId?: string }) {
    return this.healthService.logOpdVisit(body.tenantId, body.studentId, body.symptom, body.treatment, body.nurseId);
  }

  @Post('sos')
  async triggerSos(@Body() body: { tenantId: string; studentId: string; message: string }) {
    return this.healthService.triggerSos(body.tenantId, body.studentId, body.message);
  }
}
