import { Module } from '@nestjs/common';
import { SubstitutionService } from './services/substitution.service';
import { SubstitutionController } from './controllers/substitution.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TimetableService } from './services/timetable.service';

@Module({
  imports: [PrismaModule],
  controllers: [SubstitutionController],
  providers: [SubstitutionService, TimetableService],
  exports: [SubstitutionService, TimetableService],
})
export class AcademicModule {}
