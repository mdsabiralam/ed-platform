import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { BroadsheetService } from './broadsheet/broadsheet.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [BroadsheetService],
})
export class AcademicAnalyticsModule {}
