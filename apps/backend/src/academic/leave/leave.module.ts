import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [LeaveService, PrismaService],
  exports: [LeaveService],
})
export class LeaveModule {}
