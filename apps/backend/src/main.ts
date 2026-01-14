import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AllExceptionsFilter } from './shared/http-exception.filter';
import * as Sentry from '@sentry/node';
import { httpIntegration } from '@sentry/node';

async function bootstrap() {
  // ১. উইনস্টন লগার সহ অ্যাপ তৈরি
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ms }) => {
              return `${timestamp} [${level}] ${message} ${ms}`;
            }),
          ),
        }),
      ],
    }),
  });

  // Sentry Initialization (1.I.04)
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'YOUR_SENTRY_DSN_HERE', // .env ফাইলে আসল DSN রাখুন
    integrations: [
      // enable HTTP calls tracing
      httpIntegration(),
    ],
    tracesSampleRate: 1.0,
  });

  // ২. Swagger সেটআপ (ডকুমেন্টেশন)
  const config = new DocumentBuilder()
    .setTitle('Ed Platform API')
    .setDescription('The SaaS School Management API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ৩. গ্লোবাল সেটিংস
  app.enableCors(); // ক্রস অরিজিন অন করা
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // ৪. সার্ভার চালু করা (0.0.0.0 দেওয়া যাতে এমুলেটর পায়)
  await app.listen(3001, '0.0.0.0');

  // কনসোলে লিংক প্রিন্ট হবে
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap(); // ফাংশনটি এখান থেকে কল হবে
