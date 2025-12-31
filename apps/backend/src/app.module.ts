import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SaasModule } from './saas/saas.module';
import { LoggerMiddleware } from './shared/logger.middleware';
import { SubscriptionMiddleware } from './shared/subscription.middleware';
import { TenantMiddleware } from './common/middleware/tenant.middleware'; // Path check
import { TenantModule } from './tenants/tenant.module';
import { LeaveModule } from './leave/leave.module';
import { AcademicModule } from './academic/academic.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    SaasModule,
    TenantModule,
    LeaveModule,
    AcademicModule,
    AttendanceModule,
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
