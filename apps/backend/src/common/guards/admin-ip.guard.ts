import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminIpGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = request.ip || request.connection.remoteAddress;

    const allowedIps = this.configService.get<string>('ADMIN_VPN_IPS');

    // Fail Closed: If no IPs are configured, deny access to everyone for security.
    if (!allowedIps) {
        throw new ForbiddenException('Access denied: Security Configuration Missing');
    }

    const allowedList = allowedIps.split(',').map(ip => ip.trim());

    if (!allowedList.includes(clientIp)) {
      throw new ForbiddenException('Access denied: Invalid IP');
    }

    return true;
  }
}
