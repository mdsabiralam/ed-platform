import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * WARN: This guard is for Development/Testing purposes ONLY where the main Auth module is missing.
 * It bypasses real authentication and relies on headers to simulate a user.
 * DO NOT USE IN PRODUCTION.
 */
@Injectable()
export class DevBypassAuthGuard implements CanActivate {
  private readonly logger = new Logger(DevBypassAuthGuard.name);

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.warn('Using DevBypassAuthGuard - Security Risk if used in Production');
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const tenantId = request.headers['x-tenant-id'];

    if (!userId || !tenantId) {
      throw new UnauthorizedException('Missing x-user-id or x-tenant-id (Dev Auth)');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: { include: { section: true } },
        profiles: { where: { tenantId: tenantId } }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profile = user.profiles[0];
    const role = profile ? profile.role : 'PARENT';

    let classId: string | null = null;
    if (user.student && user.student.section) {
      classId = user.student.section.classId;
    }

    request.user = {
      id: userId,
      tenantId: tenantId,
      role: role,
      classId: classId
    };

    return true;
  }
}
