import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task 4: Audit Logging (CCTV Usage)
   */
  async logAccess(viewerId: string, resourceAccessed: string, ipAddress: string) {
    await this.prisma.securityAuditLog.create({
      data: {
        viewerId,
        resourceAccessed,
        ipAddress,
        timestamp: new Date(),
      },
    });
    this.logger.log(`Audit Log: User ${viewerId} accessed ${resourceAccessed} from ${ipAddress}`);
  }
}
