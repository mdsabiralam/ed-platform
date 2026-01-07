import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SaasModule } from './saas/saas.module';
import { LoggerMiddleware } from './shared/logger.middleware';
import { SubscriptionMiddleware } from './shared/subscription.middleware';
import { TenantMiddleware } from './common/middleware/tenant.middleware'; // Path check
import { TenantModule } from './tenants/tenant.module';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { MarksheetModule } from './marksheet/marksheet.module';
import { FinanceModule } from './finance/finance.module';
import { LibraryModule } from './library/library.module';
import { AcademicMarksheetModule } from './academic/marksheet/marksheet.module';
import { CommonModule } from './common/common.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrincipalModule } from './principal/principal.module';
import { AcademicAnalyticsModule } from './academic/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      max: 100, // max number of items in cache
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    SaasModule,
    TenantModule,
    MarksheetModule,
    AcademicMarksheetModule,
    FinanceModule,
    LibraryModule,
    CommonModule,
    AnalyticsModule,
    PrincipalModule,
    AcademicAnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware, LoggerMiddleware, SubscriptionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
