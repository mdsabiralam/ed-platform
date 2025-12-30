import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // This ID represents the School (Tenant) making the request
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('School ID (x-tenant-id) header is missing');
    }

    // Attach to request object for use in controllers/services
    req['tenantId'] = tenantId.toString();
    next();
  }
}
