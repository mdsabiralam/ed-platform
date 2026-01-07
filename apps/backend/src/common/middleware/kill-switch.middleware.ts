import { Injectable, NestMiddleware, Inject, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

@Injectable()
export class KillSwitchMiddleware implements NestMiddleware {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const isMaintenance = await this.redis.get('MAINTENANCE_MODE_ACTIVE');
    if (isMaintenance === 'true') {
      throw new ServiceUnavailableException('System under maintenance');
    }
    next();
  }
}
