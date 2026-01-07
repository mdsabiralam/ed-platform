import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async impersonate(tenantId: string, adminUserId: string) {
    // 1. Verify the current user is a Super Admin (Assuming verification happens in Guard or here if passed)
    // For now, we assume the caller is authorized via SuperAdminGuard (to be implemented or implied)

    // 2. Find the target tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // 3. Find an Admin profile in that tenant to impersonate
    // OR create a temporary session token with that tenant context.
    // The prompt says "context of the target school's Administrator".
    // We try to find the actual Admin user or a generic admin profile.

    const adminProfile = await this.prisma.profile.findFirst({
        where: {
            tenantId: tenantId,
            role: 'ADMIN' // Assuming 'ADMIN' is the School Owner role
        },
        include: { user: true }
    });

    if (!adminProfile) {
        throw new NotFoundException('No Admin profile found for this tenant');
    }

    // 4. Generate Token
    const payload = {
        sub: adminProfile.userId,
        email: adminProfile.user.email,
        tenantId: tenantId,
        role: 'ADMIN',
        impersonatedBy: adminUserId // Audit trail
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
