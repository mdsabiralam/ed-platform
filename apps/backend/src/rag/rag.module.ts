import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { EmbeddingService } from './embedding.service';
import { IngestionService } from './ingestion.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
      PrismaModule,
      ConfigModule,
      CacheModule.register() // In-memory cache by default, can configure Redis here
  ],
  controllers: [RagController],
  providers: [RagService, EmbeddingService, IngestionService],
  exports: [RagService, IngestionService],
})
export class RagModule {}
