import { Body, Controller, Get, Headers, Post, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { AdmissionService } from './admission.service';
import { CreateAdmissionSessionDto } from './dto/create-session.dto';

@ApiTags('Admission')
@Controller('api/admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Post('session')
  @ApiOperation({ summary: 'Create a new admission session' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 201, description: 'Session created successfully.' })
  async createSession(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateAdmissionSessionDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.admissionService.createSession(tenantId, dto);
  }

  @Get('session/active')
  @ApiOperation({ summary: 'Get the active admission session' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Active session found.' })
  @ApiResponse({ status: 404, description: 'No active session found.' })
  async getActiveSession(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.admissionService.getActiveSession(tenantId);
  }
}
