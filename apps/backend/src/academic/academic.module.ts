import { Module } from '@nestjs/common';
import { MarksheetModule } from './marksheet/marksheet.module';
import { HomeworkModule } from './homework/homework.module';

@Module({
  imports: [MarksheetModule, HomeworkModule],
  exports: [MarksheetModule, HomeworkModule],
})
export class AcademicModule {}
