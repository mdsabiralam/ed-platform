import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Attempt to resolve instituteId from headers
    const instituteId = req.headers['x-institute-id'] || req.headers['x-tenant-id'];

    if (instituteId) {
        this.cls.set('instituteId', instituteId);
    } else {
        // Fallback for development/testing or derived from subdomain logic
        // For now, setting a mock ID if none provided to prevent crashes in downstream services
        // In production, this might throw an error or handle subdomain resolution
        this.cls.set('instituteId', 'mock-school-id');
    }

    next();
  }
}
