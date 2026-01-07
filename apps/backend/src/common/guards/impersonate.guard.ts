import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class ImpersonateGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Check if user exists and is SUPER_ADMIN
    if (!user || user.role !== UserRole.SUPER_ADMIN) {
        // We throw Forbidden here or return false.
        // Returning false usually throws ForbiddenException (403) by default in NestJS guards
        return false;
    }

    // 2. Check global config IMPERSONATION_ENABLED
    const isEnabled = this.configService.get<string>('IMPERSONATION_ENABLED') === 'true';
    if (!isEnabled) {
        throw new ForbiddenException('Impersonation is disabled in this environment');
    }

    return true;
  }
}
