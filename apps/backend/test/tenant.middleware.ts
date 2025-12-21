import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // ভবিষ্যতে এখানে টেন্যান্ট রেজোলিউশন লজিক (যেমন: সাবডোমেইন বা হেডার চেক) যোগ করা হবে
    // আপাতত রিকোয়েস্ট পাস করে দিচ্ছি
    next();
  }
}