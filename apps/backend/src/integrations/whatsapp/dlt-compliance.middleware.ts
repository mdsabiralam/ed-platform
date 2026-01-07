
import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DltComplianceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DltComplianceMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Intercept outbound template messages logic?
    // Middleware usually sits on the route handler.
    // If the request is to "Send Template", we check the body.

    // We assume the route is something like POST /api/integrations/whatsapp/send-template
    // But our prompt is internal service usage mainly.

    // However, if we expose an endpoint to send templates, we check it here.
    // Or if this is for the WhatsAppService internal calls, Middleware doesn't work easily unless we use AOP/Interceptors.
    // The prompt says "Create a middleware/interceptor". Since I am in NestJS, an Interceptor is better for internal flows or global guard?
    // But "Middleware" implies HTTP request level.

    // Let's assume this protects an endpoint that sends messages.
    // For now, I'll implement it as a NestMiddleware checking a specific field if present.

    if (req.body && req.body.templateName) {
         const templateName = req.body.templateName;

         // Validate against DB
         // Since middleware is synchronous or promise-based, we can do async.

         const template = await this.prisma.whatsAppTemplate.findUnique({
             where: { templateName }
         });

         if (!template || template.status !== 'APPROVED') {
             this.logger.warn(`Blocked attempt to send unapproved template: ${templateName}`);
             throw new ForbiddenException(`Template ${templateName} is not approved or does not exist (DLT Compliance).`);
         }
    }

    next();
  }
}
