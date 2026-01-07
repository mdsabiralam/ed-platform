import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaIndicator: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaIndicator.isHealthy('database'),
      () => this.http.pingCheck('ai_service', process.env.AI_SERVICE_URL || 'http://localhost:8000/health'),
      async () => ({ redis: { status: 'up', message: 'Redis check skipped (mock)' } }), // Placeholder for Redis
    ]);
  }
}
