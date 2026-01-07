import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class MarksheetTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemplate(schoolId: string, dto: CreateTemplateDto) {
    try {
      const { name, layout_config } = dto;

      // Use as any for layout_config to match Json type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layoutConfigJson: any = layout_config;

      return await this.prisma.marksheetTemplate.create({
        data: {
          tenantId: schoolId,
          name,
          layoutConfig: layoutConfigJson,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create marksheet template');
    }
  }
}
