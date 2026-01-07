import { Controller, Post, Body, Headers, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AdmissionSessionService } from '../services/admission-session.service';
import { CreateAdmissionSessionDto } from '../dto/create-admission-session.dto';

@ApiTags('Admission Sessions')
@Controller('api/admission/session')
export class AdmissionSessionController {
  constructor(private readonly admissionSessionService: AdmissionSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admission session' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateAdmissionSessionDto,
  ) {
    return this.admissionSessionService.create(tenantId, createDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the active admission session' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  findActive(@Headers('x-tenant-id') tenantId: string) {
    return this.admissionSessionService.findActive(tenantId);
  }
}
