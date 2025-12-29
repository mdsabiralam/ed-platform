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
import { AttendanceModule } from './attendance/attendance.module';
import { LessonPlanModule } from './academic/lesson-plan/lesson-plan.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    SaasModule,
    TenantModule,
    AttendanceModule,
    LessonPlanModule,
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
