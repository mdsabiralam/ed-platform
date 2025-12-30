import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, DayOfWeek } from '@prisma/client';

@Injectable()
export class RoutineService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoutineEntry(tenantId: string, data: any) {
    // Validate required fields (basic validation)
    if (!data.classId || !data.subjectId || !data.teacherId || !data.slotId || !data.dayOfWeek) {
      throw new BadRequestException('Missing required fields');
    }

    return this.prisma.routineEntry.create({
      data: {
        tenantId, // Fixed: Used tenantId instead of schoolId
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        roomId: data.roomId,
        slotId: data.slotId,
        dayOfWeek: data.dayOfWeek,
      },
    });
  }

  async getRoutineEntries(tenantId: string, filters: { dayOfWeek?: DayOfWeek; classId?: string; teacherId?: string }) {
    const where: Prisma.RoutineEntryWhereInput = {
      tenantId, // Fixed: Used tenantId instead of schoolId
      ...(filters.dayOfWeek && { dayOfWeek: filters.dayOfWeek }),
      ...(filters.classId && { classId: filters.classId }),
      ...(filters.teacherId && { teacherId: filters.teacherId }),
    };

    return this.prisma.routineEntry.findMany({
      where,
      include: {
        class: true,
        section: true,
        subject: true,
        originalTeacher: true,
        room: true,
        slot: {
            // Fixed: Removed 'type' as it does not exist in TimeSlot model
            select: {
                startTime: true,
                endTime: true,
                name: true
            }
        },
      },
    });
  }
}
