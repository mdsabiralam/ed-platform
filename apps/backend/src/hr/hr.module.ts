import { Module } from '@nestjs/common';
import { StaffController } from './staff/staff.controller';
import { StaffService } from './staff/staff.service';
import { PrismaModule } from '../../prisma/prisma.module'; // Assuming standard location

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class HrModule {}
