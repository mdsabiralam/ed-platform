import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { MatriculateDto } from './dto/matriculate.dto';

@Controller('api/admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Post('matriculate')
  async matriculate(@Body() dto: MatriculateDto, @Req() req: any) {
    // In a real scenario, we would extract tenantId from the user or request context
    // For now, assuming it's available in the request or headers, but AdmissionService needs it.
    // However, the StudentApplication already has tenantId, so we can trust that or validate against user's tenant.

    // We'll let the service handle tenant logic based on the application.
    return this.admissionService.matriculate(dto);
  }
}
