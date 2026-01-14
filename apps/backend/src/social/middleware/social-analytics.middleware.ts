import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SocialAnalyticsService } from '../services/social-analytics.service';

@Injectable()
export class SocialAnalyticsMiddleware implements NestMiddleware {
  constructor(private readonly analyticsService: SocialAnalyticsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Check if route matches expected pattern.
    // Assuming this middleware is applied to specific routes, or we check path manually.
    // If applied to 'public/:slug' or similar.

    // Extract slug from params if available, or path.
    // Note: Middleware req.params might be empty depending on when it runs in NestJS lifecycle relative to router.
    // Safer to parse from req.path or assume strict binding.

    // If we assume route is `/r/:slug` mapped to a controller, we might need to parse URL.
    // Example: /r/some-slug-123

    // Let's assume the controller path is used.

    // Actually, getting params in middleware in NestJS can be tricky if not careful.
    // Let's assume the path structure.

    const parts = req.originalUrl.split('/');
    // e.g. /api/social/public/slug123 or /r/slug123
    const slugIndex = parts.indexOf('public'); // Adjust based on final route
    let slug = '';

    if (slugIndex !== -1 && parts.length > slugIndex + 1) {
        slug = parts[slugIndex + 1];
        // Clean query params if any
        slug = slug.split('?')[0];
    }

    if (slug) {
      const userAgent = req.headers['user-agent'] || '';
      // Fire and forget tracking to not slow down response
      this.analyticsService.trackClick(slug, userAgent).catch(err => {
          console.error('Analytics tracking failed', err);
      });
    }

    next();
  }
}
