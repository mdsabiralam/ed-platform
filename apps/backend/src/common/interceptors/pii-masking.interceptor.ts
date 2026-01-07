import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PiiMaskingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    // Mask PII in request body before logging
    const maskedBody = this.maskPii(body);

    // We can't easily modify the console.log of the framework,
    // but we can ensure *our* logs use masked data.
    // If we were replacing the global logger, we'd do it in main.ts.
    // Here we log the incoming request securely.
    this.logger.log(`Incoming Request: ${method} ${url} - Body: ${JSON.stringify(maskedBody)}`);

    return next.handle().pipe(
      tap(() => {
        // We could also mask response logs here if needed
      }),
    );
  }

  private maskPii(data: any): any {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'email', 'phone', 'firstName', 'lastName', 'dob', 'address', 'vector', 'image'];
    const masked = Array.isArray(data) ? [...data] : { ...data };

    for (const key in masked) {
      if (sensitiveFields.includes(key)) {
        masked[key] = '[REDACTED]';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskPii(masked[key]);
      }
    }
    return masked;
  }
}
