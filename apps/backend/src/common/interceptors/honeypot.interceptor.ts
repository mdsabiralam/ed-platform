import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class HoneypotInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // '_hp_check' হলো আমাদের Honey Pot ফিল্ড (ফ্রন্টএন্ডে এটি hidden থাকবে)
    // যদি এই ফিল্ডে কোনো ভ্যালু থাকে, তবে এটি বট অ্যাক্টিভিটি
    if (body && body._hp_check && body._hp_check.length > 0) {
      throw new BadRequestException('Bot activity detected');
    }

    // কন্ট্রোলারে যাওয়ার আগে ফিল্ডটি মুছে ফেলা যাতে DTO ভ্যালিডেশনে সমস্যা না হয়
    if (body && body._hp_check !== undefined) {
      delete body._hp_check;
    }

    return next.handle();
  }
}
