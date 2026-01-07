import { Module } from '@nestjs/common';
import { BiometricService } from './biometric.service';
import { SecurityAuditService } from './security-audit.service';
import { SecurityController } from './security.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  controllers: [SecurityController],
  providers: [BiometricService, SecurityAuditService],
  exports: [BiometricService, SecurityAuditService],
})
export class SecurityModule {}
