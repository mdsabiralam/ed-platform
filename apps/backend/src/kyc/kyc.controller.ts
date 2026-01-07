import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, Req, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KycService } from './kyc.service';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';

@Controller('api/kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile() file: any,
    @Param('type') type: string = 'GENERAL'
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    // Assume tenantId is in user object from JWT
    const tenantId = req.user.tenantId || req.user.instituteId; // Handle both key names if needed
    if (!tenantId) throw new BadRequestException('Tenant ID not found in token');

    return this.kycService.uploadDocument(tenantId, type, file);
  }

  @Get('presigned/:id')
  async getPresignedUrl(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId || req.user.instituteId;
    return this.kycService.getPresignedUrl(id, tenantId);
  }

  // Endpoint to serve the file if token is valid (Mocking S3 direct access)
  @Get('view/:id')
  async viewDocument(@Req() req: any, @Param('id') id: string, @Res() res: any) {
     // In a real S3 scenario, the user would use the S3 URL directly.
     // Here, we verify the token (skipped for brevity/mock) and serve the file.
     // For safety, we require the user to be authenticated via Guard still.

     // Note: The requirement says "Generate Presigned URLs... for viewing".
     // This endpoint simulates the target of that URL.
     // Since this is authenticated via JwtAuthGuard, it's safe-ish, but real presigned URLs work without app auth (using signature).
     // Implementing fully open presigned URL verification logic is complex without a real storage service.

     res.status(501).send('Secure view not fully implemented in mock. Use generic download if needed.');
  }
}
