import { Module } from '@nestjs/common';
import { BroadsheetController } from './broadsheet.controller';
import { BroadsheetService } from './broadsheet.service';
import { PrismaModule } from '../../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BroadsheetController],
  providers: [BroadsheetService],
})
export class BroadsheetModule {}
