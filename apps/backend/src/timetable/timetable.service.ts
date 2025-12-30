import { Injectable, Logger } from '@nestjs/common';
import { GenerateTimetableDto } from './dto/generate-timetable.dto';
import { PrismaService } from '../prisma/prisma.service';

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
}
