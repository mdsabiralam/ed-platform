import { Controller, Post, UseInterceptors, UploadedFile, Param, BadRequestException, NotFoundException, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiHeader, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../services/storage.service';

@ApiTags('Academic - Staff')
@Controller('api/academic/staff')
export class StaffController {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService
  ) {}

  @Post(':id/signature')
  @ApiOperation({ summary: 'Upload staff signature' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSignature(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @UploadedFile() file: any
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');
    if (!file) throw new BadRequestException('File required');

    const staff = await this.prisma.staffProfile.findFirst({
        where: { id, tenantId }
    });

    if (!staff) throw new NotFoundException('Staff profile not found');

    const url = await this.storageService.uploadFile(file);

    return this.prisma.staffProfile.update({
        where: { id },
        data: { signatureUrl: url }
    });
  }
}
