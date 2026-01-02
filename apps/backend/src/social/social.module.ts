import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { SocialController } from './controller/social.controller';
import { SocialAnalyticsService } from './services/social-analytics.service';
import { SocialAnalyticsMiddleware } from './middleware/social-analytics.middleware';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SocialController],
  providers: [SocialAnalyticsService],
})
export class SocialModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SocialAnalyticsMiddleware)
      .forRoutes({ path: 'social/public/:slug', method: RequestMethod.GET });
  }
}
