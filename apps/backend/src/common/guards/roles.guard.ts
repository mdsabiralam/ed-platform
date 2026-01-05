import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../auth/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false;
    }

    return this.matchRoles(requiredRoles, user.role);
  }

  private matchRoles(requiredRoles: Role[], userRole: Role): boolean {
    // 1. SUPER_ADMIN has access to EVERYTHING
    if (userRole === Role.SUPER_ADMIN) {
      return true;
    }

    // Check strict match
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // 2. INSTITUTE_ADMIN has TEACHER and STAFF permissions
    if (userRole === Role.INSTITUTE_ADMIN) {
      if (requiredRoles.includes(Role.TEACHER) || requiredRoles.includes(Role.STAFF)) {
        return true;
      }
    }

    // 3. TEACHER does NOT have Admin permissions (handled by default false)
    return false;
  }
}
