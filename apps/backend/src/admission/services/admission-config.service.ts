import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdmissionConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(tenantId: string, key: string): Promise<string | null> {
    const config = await this.prisma.admissionConfig.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key,
        },
      },
    });
    return config ? config.value : null;
  }
}
