
import { Module } from '@nestjs/common';
import { ResultController } from './result/result.controller';
import { MarksController } from './marks/marks.controller';
import { BroadsheetController } from './analytics/broadsheet/broadsheet.controller';
import { ResultService } from './result/result.service';
import { MarksService } from './marks/marks.service';
import { BroadsheetService } from './analytics/broadsheet/broadsheet.service';
import { MarksheetGeneratorService } from './marksheet/marksheet-generator.service';

@Module({
  controllers: [ResultController, MarksController, BroadsheetController],
  providers: [ResultService, MarksService, BroadsheetService, MarksheetGeneratorService],
  exports: [ResultService, MarksService, BroadsheetService, MarksheetGeneratorService],
})
export class AcademicModule {}
