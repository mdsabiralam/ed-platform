import { Module } from '@nestjs/common';
import { CertificateService } from './certificate/certificate.service';
import { SubstitutionService } from './substitution/substitution.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CertificateService, SubstitutionService],
  exports: [CertificateService, SubstitutionService],
})
export class AcademicModule {}
