import { Module } from '@nestjs/common';
import { MarksheetController } from './marksheet.controller';
import { MarksheetService } from './marksheet.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarksheetController],
  providers: [MarksheetService],
})
export class MarksheetModule {}
