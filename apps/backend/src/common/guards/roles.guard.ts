import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    // Assuming user is attached to request by JwtAuthGuard and has a role property (e.g. from current profile)
    // Or checking global role if SUPER_ADMIN is a global concept not tied to a profile
    // The prompt says "Only a user with Role.SUPER_ADMIN".
    const user = request.user;

    // In strict scaffold, we assume user object has roles or role.
    // Based on scoped JWT implementation, role is in the payload.
    return roles.includes(user?.role);
  }
}
