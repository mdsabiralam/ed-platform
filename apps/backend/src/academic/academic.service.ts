import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  async logAttendance(
    tenantId: string,
    studentId: string,
    routineId: string,
    action: 'JOIN' | 'LEAVE',
  ) {
    if (action === 'JOIN') {
      return this.prisma.liveAttendanceLog.create({
        data: {
          studentId,
          routineEntryId: routineId,
          joinTime: new Date(),
        },
      });
    } else if (action === 'LEAVE') {
      // Find the active session (where leaveTime is null)
      // Sort by joinTime desc to get the latest one
      const activeLog = await this.prisma.liveAttendanceLog.findFirst({
        where: {
          studentId,
          routineEntryId: routineId,
          leaveTime: null,
        },
        orderBy: {
          joinTime: 'desc',
        },
      });

      if (!activeLog) {
        // Option: Ignore or throw. Thowing might be noisy if user double clicks leave.
        // Let's return null or a message.
        throw new NotFoundException('No active session found to leave');
      }

      return this.prisma.liveAttendanceLog.update({
        where: { id: activeLog.id },
        data: {
          leaveTime: new Date(),
        },
      });
    } else {
      throw new BadRequestException('Invalid action');
    }
  }
}
