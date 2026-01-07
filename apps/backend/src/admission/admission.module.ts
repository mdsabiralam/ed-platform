import { Module } from '@nestjs/common';
import { AdmissionSessionService } from './services/admission-session.service';
import { AdmissionConfigService } from './services/admission-config.service';
import { AdmissionSessionController } from './controllers/admission-session.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdmissionSessionController],
  providers: [AdmissionSessionService, AdmissionConfigService],
  exports: [AdmissionConfigService],
})
export class AdmissionModule {}
