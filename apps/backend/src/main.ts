import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
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

  // Register Global Filters, Interceptors, and Pipes
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Apply Tenant Middleware
  // Note: Middleware in NestJS main.ts via app.use() applies to *all* routes.
  // We use a middleware function if we want simple express middleware,
  // but TenantMiddleware is a class. NestJS class middleware is usually applied in a Module (AppModule).
  // However, the prompt asked to "Apply TenantMiddleware using app.use()".
  // `app.use()` expects a functional middleware or an instance.
  // Since TenantMiddleware is a class with `use`, we can instantiate it,
  // BUT it won't have dependency injection if we do `new TenantMiddleware()`.
  // If `TenantMiddleware` has no dependencies, `app.use(new TenantMiddleware().use)` works.
  // The provided code has no constructor deps, so this is safe.
  app.use(new TenantMiddleware().use);

    // ৪. সার্ভার চালু করা (0.0.0.0 দেওয়া যাতে এমুলেটর পায়)
  await app.listen(3000, '0.0.0.0');
  
  // কনসোলে লিংক প্রিন্ট হবে
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap(); // ফাংশনটি এখান থেকে কল হবে
