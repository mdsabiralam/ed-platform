import { Module } from '@nestjs/common';
import { SubstitutionService } from './services/substitution.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubstitutionService],
  exports: [SubstitutionService],
})
export class AcademicModule {}
