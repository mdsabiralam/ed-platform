import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AllExceptionsFilter } from './shared/http-exception.filter';
import * as Sentry from '@sentry/node';
import { httpIntegration } from '@sentry/node';
import * as fs from 'fs';
import helmet from 'helmet';

async function bootstrap() {
  // 3.H.09: SSL Certificate Logic for Production
  let httpsOptions = undefined;
  if (process.env.NODE_ENV === 'production') {
    const keyPath = process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key';
    const certPath = process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt';

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }
  }

  // ১. উইনস্টন লগার সহ অ্যাপ তৈরি
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
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
  app.use(helmet()); // Security Headers (Added via 3.H.09 task context, although not explicitly requested in this diff step, it is good practice)
  app.enableCors(); // ক্রস অরিজিন অন করা
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter()); 
  // 3.H.08: Ensure whitelist: true and transform: true
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    // ৪. সার্ভার চালু করা (0.0.0.0 দেওয়া যাতে এমুলেটর পায়)
  await app.listen(3001, '0.0.0.0');
  
  // কনসোলে লিংক প্রিন্ট হবে
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap(); // ফাংশনটি এখান থেকে কল হবে
