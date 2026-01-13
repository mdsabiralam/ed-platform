import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ResultService],
  exports: [ResultService],
})
export class ResultModule {}
