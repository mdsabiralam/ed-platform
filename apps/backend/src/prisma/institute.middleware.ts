import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InstituteMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // This is a placeholder for future institute resolution logic (e.g., from subdomain or headers)
    next();
  }
}