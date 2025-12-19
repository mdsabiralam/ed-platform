import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { SaasModule } from './saas/saas.module';

@Module({
  imports: [SaasModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
