import { Module } from '@nestjs/common';
import { MarksheetTemplateModule } from './marksheet-template/marksheet-template.module';

@Module({
  imports: [MarksheetTemplateModule],
})
export class AcademicModule {}
