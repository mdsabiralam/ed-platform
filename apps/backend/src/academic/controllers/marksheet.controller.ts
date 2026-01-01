import { Controller, Put, Param, Body, Headers, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

@ApiTags('Academic - Marksheet')
@Controller('api/academic/class')
export class MarksheetController {
  constructor(private prisma: PrismaService) {}

  @Put(':id/assign-template')
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
}
