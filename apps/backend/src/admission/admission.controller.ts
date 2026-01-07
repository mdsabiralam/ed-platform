import { Controller, Post, Body, Get, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admission')
@Controller('api/admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new student application' })
  async register(@Body() dto: any) {
    return this.admissionService.register(dto);
  }

  @Post('matriculate')
  @ApiOperation({ summary: 'Matriculate an approved application' })
  async matriculate(@Body() body: { applicationId: string }) {
    return this.admissionService.matriculate(body.applicationId);
  }

  @Get('id-card/:studentId')
  @ApiOperation({ summary: 'Get ID Card PDF URL' })
  async getIdCard(@Param('studentId') studentId: string) {
    // 4.J.05 PDF QA
    return this.admissionService.generateIdCard(studentId);
  }
}
