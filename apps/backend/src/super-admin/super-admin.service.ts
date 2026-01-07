import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async impersonateUser(adminUserId: string, targetUserId: string, ipAddress?: string) {
    const admin = await this.prisma.platformAdmin.findUnique({
      where: { userId: adminUserId },
    });

    if (!admin) {
      throw new UnauthorizedException('Administrator record not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        profiles: {
            take: 1,
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Target user not found');
    }

    // Log the impersonation event
    await this.prisma.platformAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'IMPERSONATE_USER',
        target: targetUserId,
        ipAddress: ipAddress,
        details: { targetEmail: user.email },
      },
    });

    let instituteId = null;
    let role = null;

    if (user.profiles && user.profiles.length > 0) {
        const profile = user.profiles[0];
        instituteId = profile.tenantId;
        role = profile.role;
    }

    const payload = {
      sub: user.id,
      instituteId: instituteId,
      role: role,
    };

    return this.authService.generateTokens(payload);
  }
}
