import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SecurityController],
  providers: [AuditService],
  exports: [AuditService],
})
export class SecurityModule {}
