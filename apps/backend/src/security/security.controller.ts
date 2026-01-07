import { Controller, Post, UseGuards, ForbiddenException, Req, Body, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';
import { AdminIpGuard } from '../common/guards/admin-ip.guard';
import { Request } from 'express';
import Redis from 'ioredis';

@Controller('admin/security')
export class SecurityController {
  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  @Post('panic-mode')
  @UseGuards(AdminIpGuard)
  async enablePanicMode(@Req() req: Request, @Body() body: any) {
    // 1. Call Cloudflare API (Mock implementation)
    console.log('Enabling Under Attack Mode via Cloudflare API...');

    // 2. Update System Status in Redis
    await this.redis.set('MAINTENANCE_MODE_ACTIVE', 'true');

    // 3. Log to Audit
    await this.auditService.logAction(
      'super-admin', // Mock admin ID
      'ENABLE_PANIC_MODE',
      'System',
      { reason: 'Manual Trigger' },
      req.ip || 'unknown',
      req.headers['user-agent'] || 'unknown',
    );

    return { status: 'Panic Mode Enabled', maintenance: true };
  }
}
