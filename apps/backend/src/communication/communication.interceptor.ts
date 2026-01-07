import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CommunicationAuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().tap(async () => {
       // This runs after successful execution
       const body = request.body;
       const user = request.user;

       // Example logic: if body has content/recipient
       if (body && (body.content || body.message) && body.recipientId) {
         const content = body.content || body.message;
         const contentHash = crypto.createHash('sha256').update(content).digest('hex');

         await this.prisma.communicationAuditLog.create({
           data: {
             senderId: user?.id || 'system',
             recipientId: body.recipientId,
             contentHash: contentHash,
             channel: 'CHAT', // Determine from context or body.channel
             ipAddress: request.ip,
             metadata: body
           }
         }).catch(err => console.error("Audit Log Error", err));
       }
    });
  }
}
