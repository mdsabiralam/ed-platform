import { Module } from '@nestjs/common';
import { SubstitutionService } from './services/substitution.service';
import { SubstitutionController } from './controllers/substitution.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
  exports: [SubstitutionService],
})
export class AcademicModule {}
