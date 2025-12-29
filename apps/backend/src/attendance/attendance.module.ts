import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendanceListener } from '../events/attendance.listener';
import { AttendanceCronService } from '../jobs/attendance.cron';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceListener, AttendanceCronService],
})
export class AttendanceModule {}
