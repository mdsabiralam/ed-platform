import { Module } from '@nestjs/common';
import { MarksheetController } from './marksheet.controller';
import { MarksheetService } from './marksheet.service';

@Module({
  controllers: [MarksheetController],
  providers: [MarksheetService],
})
export class MarksheetModule {}
