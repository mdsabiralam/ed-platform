import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BlocklistMiddleware implements NestMiddleware {
  // Placeholder for blocked IPs. In a real app, this would come from a database or Redis.
  private readonly blockedIps = ['192.168.0.0'];

  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip || req.connection.remoteAddress;

    if (this.isBlocked(clientIp)) {
      throw new ForbiddenException('Your IP address is blocked.');
    }

    next();
  }

  private isBlocked(ip: string | undefined): boolean {
    if (!ip) return false;
    // Simple check. In production, use a more robust matching strategy (CIDR, etc.)
    return this.blockedIps.includes(ip);
  }
}
