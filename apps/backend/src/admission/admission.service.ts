import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdmissionSessionDto } from './dto/create-session.dto';

@Injectable()
export class AdmissionService {
  constructor(private prisma: PrismaService) {}

  async createSession(tenantId: string, dto: CreateAdmissionSessionDto) {
    const { name, startDate, endDate, isActive } = dto;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.prisma.$transaction(async (tx) => {
      // If the new session is set to active, deactivate all other sessions for this tenant
      if (isActive) {
        await tx.admissionSession.updateMany({
          where: { tenantId, isActive: true },
          data: { isActive: false },
        });
      }

      const session = await tx.admissionSession.create({
        data: {
          tenantId,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive ?? false,
        },
      });

      return session;
    });
  }

  async getActiveSession(tenantId: string) {
    const session = await this.prisma.admissionSession.findFirst({
      where: {
        tenantId,
        isActive: true,
      },
    });

    if (!session) {
      throw new NotFoundException('No active admission session found');
    }

    return session;
  }

  async getSessionById(tenantId: string, id: string) {
    const session = await this.prisma.admissionSession.findFirst({
      where: { id, tenantId },
    });

    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getConfig(tenantId: string, key: string) {
    const config = await this.prisma.admissionConfig.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key,
        },
      },
    });

    return config?.value || null;
  }

  async setConfig(tenantId: string, key: string, value: string) {
    return this.prisma.admissionConfig.upsert({
      where: {
        tenantId_key: {
          tenantId,
          key,
        },
      },
      update: { value },
      create: { tenantId, key, value },
    });
  }

  async checkSessionValidity(sessionId: string) {
    const session = await this.prisma.admissionSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (new Date() > session.endDate) {
      throw new BadRequestException('Session Expired');
    }

    return true;
  }

  async checkClassCapacity(tenantId: string, classId: string, sessionId: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id: classId, tenantId },
      include: {
        _count: {
          select: {
            sections: {
              select: {
                students: {
                  where: { admissionSessionId: sessionId }
                }
              }
            }
          }
        }
      }
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    // Since Prisma _count on nested relations with where clause might be complex or return structure diff
    // Alternate: Count students directly
    const currentAdmissionsCount = await this.prisma.student.count({
      where: {
        tenantId,
        admissionSessionId: sessionId,
        section: {
          classId: classId
        }
      }
    });

    if (currentAdmissionsCount >= classData.seatCapacity) {
      throw new BadRequestException('Class seat capacity reached');
    }

    return true;
  }
}
