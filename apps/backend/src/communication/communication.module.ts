import { Module } from '@nestjs/common';
import { NoticeController } from './notices/notice.controller';
import { NoticeService } from './notices/notice.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class CommunicationModule {}
