import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/** Subscription Check Middleware */
@Injectable()
export class SubscriptionMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip subscription check for auth and health routes
    if (req.baseUrl.includes('/auth') || req.baseUrl.includes('/health')) {
      return next();
    }

    const tenantId = req.headers['x-tenant-id'];

    if (tenantId) {
      const subscription = await this.prisma.tenantSubscription.findFirst({
        where: {
          tenantId: tenantId as string,
          expiryDate: { gt: new Date() }, // Check if not expired
        },
      });

      if (!subscription) {
        throw new ForbiddenException('Institute subscription is missing or expired.');
      }
    }

    next();
  }
}
