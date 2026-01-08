import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/** Subscription Check Middleware */
@Injectable()
export class SubscriptionMiddleware implements NestMiddleware {
  // Exclusion list: URLs that should bypass subscription checks
  private readonly exclusionList = [
    '/api/subscription/renew',
    '/api/health', // Standard health check
    '/api/auth/login', // Login should work
    // Add other public endpoints if necessary
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // 3.H.07: Exclusion List Check
    if (this.isExcluded(req.originalUrl)) {
      return next();
    }

    // TODO: In a real scenario, this data would come from the database (e.g., via TenantMiddleware)
    // or an injected service. For now, we simulate using headers or assume it's attached to req.
    // Example: const tenant = req['tenant'];
    
    // Simulating subscription data for verification of logic (3.H.06)
    // We try to read from a hypothetical request property or header for testing purposes.
    // In production, `TenantMiddleware` should attach the tenant with subscription info.
    const expiryDateTimestamp = req.headers['x-subscription-expiry']
      ? parseInt(req.headers['x-subscription-expiry'] as string, 10)
      : null; // Default to null (valid or unknown) if not provided for now

    if (expiryDateTimestamp) {
       // 3.H.06: Logic Verification
       // Grace period in milliseconds (e.g., 7 days)
       const GRACE_PERIOD_DAYS = 7;
       const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

       const now = Date.now();
       const expiryWithGrace = expiryDateTimestamp + GRACE_PERIOD_MS;

       if (expiryWithGrace < now) {
         throw new ForbiddenException('Subscription has expired (including grace period). Please renew.');
       }
    }

    // Keep old check for backward compatibility/demo
    const subscriptionStatus = req.headers['x-subscription-status'];
    if (subscriptionStatus === 'expired') {
       // We can assume this simplified status check also implies grace period is over
       throw new ForbiddenException('Subscription has expired. Please renew.');
    }

    next();
  }

  private isExcluded(url: string): boolean {
    return this.exclusionList.some(excludedPath => url.startsWith(excludedPath));
  }
}
