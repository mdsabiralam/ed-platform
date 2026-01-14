import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/** Subscription Check Middleware */
@Injectable()
export class SubscriptionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // TODO: এখানে আসল অথেন্টিকেশন এবং ডাটাবেস চেক বসাতে হবে।
    // উদাহরণের জন্য আমরা ধরে নিচ্ছি হেডারে 'x-subscription-status' আছে।

    // 1.I.09: Unauthorized Check (Example)
    // যদি ইউজার লগইন না থাকে (সাধারণত AuthGuard এটা দেখে, তবে এখানে ডেমো দেখানো হলো)
    // const isAuthenticated = true;
    // if (!isAuthenticated) throw new UnauthorizedException('User not authenticated');

    // 1.I.10: Forbidden (Subscription Expired) Check
    const subscriptionStatus = req.headers['x-subscription-status'];

    if (subscriptionStatus === 'expired') {
      throw new ForbiddenException('Subscription has expired. Please renew.');
    }

    next();
  }
}
