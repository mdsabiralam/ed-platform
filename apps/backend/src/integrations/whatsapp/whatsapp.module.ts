
import { Module, MiddlewareConsumer, RequestMethod, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';
import { DltComplianceMiddleware } from './dlt-compliance.middleware';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    MetaWhatsAppProvider,
  ],
  exports: [WhatsAppService],
})
export class WhatsAppModule implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const requiredVars = [
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID'
    ];

    for (const key of requiredVars) {
      if (!this.configService.get(key)) {
        this.logger.error(`Missing required environment variable: ${key}`);
        // throw new Error(`Missing required environment variable: ${key}`);
        // Warning only to avoid crashing app if feature is not enabled yet
      }
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DltComplianceMiddleware)
      .forRoutes({ path: 'whatsapp/send-template', method: RequestMethod.POST });
  }
}
