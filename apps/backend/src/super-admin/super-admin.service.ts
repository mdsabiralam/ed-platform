import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async impersonateUser(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        profiles: {
            take: 1, // Default to first profile if multiple, or could be improved to select specific
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Target user not found');
    }

    // Default to the user's first profile for the initial context, or a "neutral" context if none.
    // However, the AuthService.generateTokens expects instituteId and role.
    // If the user has no profiles, they might not be able to do much, but we can generate a token with nulls if permitted,
    // or we must require a profile.
    // For now, let's assume valid users have at least one profile or we pick the first one found.

    let instituteId = null;
    let role = null;

    if (user.profiles && user.profiles.length > 0) {
        const profile = user.profiles[0];
        instituteId = profile.tenantId;
        role = profile.role;
    }

    // Generate token without password check
    const payload = {
      sub: user.id,
      instituteId: instituteId,
      role: role,
    };

    return this.authService.generateTokens(payload);
  }
}
