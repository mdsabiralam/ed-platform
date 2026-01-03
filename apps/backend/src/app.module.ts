import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SaasModule } from './saas/saas.module';
import { LoggerMiddleware } from './shared/logger.middleware';
import { SubscriptionMiddleware } from './shared/subscription.middleware';
import { TenantMiddleware } from './common/middleware/tenant.middleware'; // Path check
import { TenantModule } from './tenants/tenant.module';
import { PrincipalModule } from './principal/principal.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BroadsheetModule } from './academic/analytics/broadsheet/broadsheet.module';
import { MarksheetController } from './academic/marksheet/marksheet.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SaasModule,
    TenantModule,
    PrincipalModule,
    AnalyticsModule,
    BroadsheetModule,
  ],
  controllers: [AppController, MarksheetController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware, LoggerMiddleware, SubscriptionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
