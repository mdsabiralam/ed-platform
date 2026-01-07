import './instrumentation'; // Must be imported before other imports
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as CloudWatchTransport from 'winston-cloudwatch';
import * as api from '@opentelemetry/api';

async function bootstrap() {
  // 1. Sentry Initialization
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0', // Replace with valid DSN
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  // 2. Winston Logger Configuration with CloudWatch
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('EdTech', {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
      // CloudWatch Transport
      new CloudWatchTransport({
        logGroupName: 'edtech-backend-logs',
        logStreamName: `backend-${new Date().toISOString()}`,
        awsOptions: {
           region: process.env.AWS_REGION || 'ap-south-1',
           credentials: {
               accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
               secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
           }
        },
        jsonMessage: true,
        messageFormatter: (item) => {
            const span = api.trace.getSpan(api.context.active());
            const traceId = span ? span.spanContext().traceId : 'unknown';

            return JSON.stringify({
                level: item.level,
                message: item.message,
                timestamp: item.timestamp,
                trace_id: traceId,
                environment: process.env.NODE_ENV || 'development'
            });
        }
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });

  app.enableCors(); // Enable CORS for development
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('EdTech Platform API')
    .setDescription('API documentation for the EdTech Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
