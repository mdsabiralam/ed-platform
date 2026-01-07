import { Module } from '@nestjs/common';
import { HelpdeskService } from './helpdesk.service';
import { HelpdeskController } from './helpdesk.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HelpdeskController],
  providers: [HelpdeskService],
})
export class HelpdeskModule {}
