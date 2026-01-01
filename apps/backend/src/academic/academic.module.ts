import { Module } from '@nestjs/common';
import { CurriculumModule } from './curriculum/curriculum.module';

@Module({
  imports: [CurriculumModule],
})
export class AcademicModule {}
