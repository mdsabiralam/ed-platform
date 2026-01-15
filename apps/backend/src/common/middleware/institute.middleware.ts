import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class InstituteMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const instituteId = req.headers['x-institute-id'];

    if (instituteId) {
      // Store in CLS for easy access in services/Prisma
      this.cls.set('instituteId', instituteId);
      // Also attach to request for controllers that might check it directly
      (req as any).instituteId = instituteId;
    } else {
      // Define public routes that don't need institute context (e.g., health check, documentation, auth)
      // For now, assuming most business routes are protected.
      // If we need strict enforcement:
      // throw new BadRequestException('x-institute-id header is missing');

      // However, typical middleware patterns might allow some paths.
      // The prompt says "If missing on protected routes, throw a BadRequestException."
      // Since middleware runs before guards, it's hard to know if a route is "protected" just by path here without a list.
      // But typically, a global middleware applies to everything.
      // Let's assume we enforce it generally but maybe allow a bypass if needed or let the guard handle it?
      // The prompt explicitly says: "If missing on protected routes, throw a BadRequestException."
      // This implies we need to identify protected routes.
      // A common simple strategy: exclude specific paths.

      const publicPaths = ['/health', '/api/docs', '/api/auth/login', '/api/auth/register'];
      // Basic check - usually we might check startsWith or regex
      const isPublic = publicPaths.some(path => req.originalUrl.startsWith(path));

      if (!isPublic) {
         // Check if it's really missing or just not needed?
         // User instruction: "If missing on protected routes, throw a BadRequestException."
         // I will throw it for now for all non-public paths.
         throw new BadRequestException('x-institute-id header is missing');
      }
    }

    next();
  }
}
