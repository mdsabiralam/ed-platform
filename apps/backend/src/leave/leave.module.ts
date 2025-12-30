import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
