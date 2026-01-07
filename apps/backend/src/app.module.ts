import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SaasModule } from './saas/saas.module';
import { TenantModule } from './tenants/tenant.module';
import { LoggerMiddleware } from './shared/logger.middleware';
import { SubscriptionMiddleware } from './shared/subscription.middleware';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { KillSwitchMiddleware } from './common/middleware/kill-switch.middleware';
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from './security/security.module';
import { RedisModule } from './shared/redis.module';
import { SuperAdminModule } from './admin/super/super-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
        ttl: 60000,
        limit: 100,
    }]),
    PrismaModule,
    SaasModule,
    TenantModule,
    AuthModule,
    SecurityModule,
    RedisModule,
    SuperAdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(KillSwitchMiddleware) // Global Kill-Switch first
      .forRoutes({ path: '*', method: RequestMethod.ALL })
      .apply(TenantMiddleware, LoggerMiddleware, SubscriptionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
