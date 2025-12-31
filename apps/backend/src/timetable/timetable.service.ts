import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DayOfWeek } from '@prisma/client';

@Injectable()
export class TimetableService {
  private readonly logger = new Logger(TimetableService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findFiltered(filters: {
    classId?: string;
    teacherId?: string;
    subjectId?: string;
    roomId?: string;
    day?: string;
    schoolId?: string;
  }) {
    const { classId, teacherId, subjectId, roomId, day, schoolId } = filters;

    const where: any = {};
    if (schoolId) where.schoolId = schoolId;
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (subjectId) where.subjectId = subjectId;
    if (roomId) where.roomId = roomId;
    if (day) where.dayOfWeek = day;

    const entries = await this.prisma.routineEntry.findMany({
      where,
      include: {
        subject: true,
        teacher: true,
        room: true,
        slot: true,
        substitutions: {
          where: { status: 'ASSIGNED' }, // Include only confirmed subs
          include: { substituteTeacher: true },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { slot: { startTime: 'asc' } },
      ],
    });

    // Grouping logic can be done here or on the frontend.
    // Given the requirement "Ensure the response groups data by dayOfWeek", I will group it here.
    const grouped = entries.reduce((acc, entry) => {
      const day = entry.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(entry);
      return acc;
    }, {});

    return grouped;
  }

  validateRequest(dto: GenerateTimetableDto) {
    this.logger.log('Validating timetable configuration request', dto);
    return {
      status: 'valid',
      message: 'Configuration is ready for processing',
    };
  }

  async validateConflict(teacherId: string, classId: string, dayOfWeek: DayOfWeek, slotId: string) {
    // 1. Check if Teacher is busy
    const teacherBusy = await this.prisma.routineEntry.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        slotId,
      },
    });

    if (teacherBusy) {
      throw new ConflictException(`Teacher ${teacherId} is already assigned at this time.`);
    }

    // 2. Check if Class is busy
    const classBusy = await this.prisma.routineEntry.findFirst({
      where: {
        classId,
        dayOfWeek,
        slotId,
      },
    });

    if (classBusy) {
      throw new ConflictException(`Class ${classId} already has a subject at this time.`);
    }

    return true;
  }
}
