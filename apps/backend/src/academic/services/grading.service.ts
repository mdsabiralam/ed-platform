import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GradingService {
  constructor(private prisma: PrismaService) {}

  async getAllGradingScales(tenantId: string) {
    return this.prisma.gradingScale.findMany({
      where: {
        OR: [
          { tenantId: tenantId },
          { tenantId: null }
        ]
      },
      include: { gradingLogics: true }
    });
  }

  async updateGradingScale(tenantId: string, scaleId: string, data: any) {
    const scale = await this.prisma.gradingScale.findUnique({ where: { id: scaleId } });
    if (!scale) throw new NotFoundException('Scale not found');

    if (scale.tenantId !== tenantId) {
        if (scale.tenantId === null) {
             throw new ForbiddenException('Cannot edit global grading scale.');
        }
        throw new ForbiddenException('Access denied');
    }

    return this.prisma.$transaction(async (tx) => {
        await tx.gradingLogic.deleteMany({ where: { scaleId } });

        await tx.gradingScale.update({
            where: { id: scaleId },
            data: {
                name: data.name,
                isMarksBased: data.isMarksBased
            }
        });

        if (data.gradingLogics && Array.isArray(data.gradingLogics)) {
            await tx.gradingLogic.createMany({
                data: data.gradingLogics.map((l: any) => ({
                    scaleId,
                    label: l.label,
                    minScore: l.minScore,
                    maxScore: l.maxScore,
                    gradePoint: l.gradePoint
                }))
            });
        }

        return tx.gradingScale.findUnique({ where: { id: scaleId }, include: { gradingLogics: true }});
    });
  }

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
