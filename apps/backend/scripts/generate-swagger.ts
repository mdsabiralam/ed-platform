import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Ed-Platform API')
    .setDescription('The Ed-Platform API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = path.resolve(process.cwd(), 'swagger.json');

  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`Swagger JSON generated at ${outputPath}`);

  await app.close();
  process.exit(0);
}

generateSwagger();
