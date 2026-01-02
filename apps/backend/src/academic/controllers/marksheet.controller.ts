import { Controller, Put, Post, Get, Param, Body, Headers, Res, BadRequestException, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { StorageService } from '../services/storage.service';
import { Response } from 'express';
import { MarksheetLayout } from '../interfaces/marksheet-layout.interface';

@ApiTags('Academic - Marksheet')
@Controller('api/academic')
export class MarksheetController {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfGeneratorService,
    private storageService: StorageService
  ) {}

  @Post('template/upload-background')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload background image' })
  async uploadBackground(@UploadedFile() file: any) {
      if (!file) throw new BadRequestException('File required');
      const url = await this.storageService.uploadFile(file);
      return { url };
  }

  @Put('class/:id/assign-template')
  @ApiOperation({ summary: 'Assign marksheet template to class' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async assignTemplate(
    @Param('id') classId: string,
    @Body('templateId') templateId: string,
    @Headers('x-tenant-id') tenantId: string
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');

    const classExists = await this.prisma.class.findFirst({
        where: { id: classId, tenantId }
    });
    if (!classExists) throw new BadRequestException('Class not found');

    const template = await this.prisma.marksheetTemplate.findFirst({
        where: { id: templateId, tenantId }
    });
    if (!template) throw new BadRequestException('Template not found');

    return this.prisma.class.update({
        where: { id: classId },
        data: { templateId }
    });
  }

  @Get('template/preview/:id')
  @ApiOperation({ summary: 'Preview marksheet template' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async previewTemplate(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Res() res: any
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID required');

    const template = await this.prisma.marksheetTemplate.findFirst({
        where: { id, tenantId }
    });
    if (!template) throw new NotFoundException('Template not found');

    const dummyData = {
        name: 'John Doe',
        roll: '1',
        dob: '2010-01-01',
        class: '10',
        section: 'A',
        marks: [
            { subject: 'Math', max: 100, obtained: 95, grade: 'A1', percentage: 95, remarks: 'Excellent' },
            { subject: 'English', max: 100, obtained: 88, grade: 'A2', percentage: 88, remarks: 'Good' }
        ]
    };

    const pdfBytes = await this.pdfService.generatePdf(
        template.structureJson as unknown as MarksheetLayout,
        dummyData,
        {
            backgroundImageUrl: template.backgroundImageUrl || undefined,
            disclaimerText: template.disclaimerText || undefined,
            pageSize: template.pageSize
        }
    );

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="preview-${id}.pdf"`,
        'Content-Length': pdfBytes.length,
    });
    res.end(Buffer.from(pdfBytes));
  }
}
