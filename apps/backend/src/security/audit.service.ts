import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(adminId: string, action: string, target: string, details: any, ipAddress: string, userAgent: string) {
    return this.prisma.platformAuditLog.create({
      data: {
        adminId,
        action,
        target,
        details,
        ipAddress,
        userAgent,
      },
    });
  }
}
