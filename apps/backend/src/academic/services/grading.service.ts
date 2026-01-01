import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GradingService {
  constructor(private prisma: PrismaService) {}

  async getGradingScaleForSubject(tenantId: string, subjectId: string, classId: string) {
    // 1. Try to find specific mapping for the class
    let map = await this.prisma.subjectGradingMap.findFirst({
      where: {
        tenantId,
        subjectId,
        classId,
      },
      include: { gradingScale: { include: { gradingLogics: true } } },
    });

    // 2. If no specific class map, try general subject map (classId is null)
    if (!map) {
      map = await this.prisma.subjectGradingMap.findFirst({
        where: {
          tenantId,
          subjectId,
          classId: null,
        },
        include: { gradingScale: { include: { gradingLogics: true } } },
      });
    }

    if (map) {
      return map.gradingScale;
    }

    // 3. Fallback to Tenant Default
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { defaultGradingScale: { include: { gradingLogics: true } } },
    });

    if (tenant?.defaultGradingScale) {
      return tenant.defaultGradingScale;
    }

    // 4. Global Fallback (e.g., CBSE Secondary)
    const globalDefault = await this.prisma.gradingScale.findFirst({
      where: { name: 'CBSE Secondary', tenantId: null },
      include: { gradingLogics: true },
    });

    return globalDefault;
  }
}
