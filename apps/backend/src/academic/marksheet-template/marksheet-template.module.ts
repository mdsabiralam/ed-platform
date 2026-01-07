import { Module } from '@nestjs/common';
import { MarksheetTemplateController } from './marksheet-template.controller';
import { MarksheetTemplateService } from './marksheet-template.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarksheetTemplateController],
  providers: [MarksheetTemplateService],
})
export class MarksheetTemplateModule {}
