import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';

@Module({
  controllers: [SubstitutionController],
  providers: [SubstitutionService],
})
export class AcademicModule {}
