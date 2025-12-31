import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DayOfWeek } from '@prisma/client';

// DTO for creating a new routine entry
export class CreateRoutineEntryDto {
    dayOfWeek: DayOfWeek;
    slotId: string;
    sectionId: string;
    teacherId: string;
    roomId: string;
    subjectId: string;
    classId: string;
}


@Injectable()
export class RoutineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates if a new routine entry would cause a conflict.
   * @param dto The data for the new routine entry.
   * @param schoolId The ID of the school.
   */
  private async validateConflict(dto: CreateRoutineEntryDto, schoolId: string) {
    // Check 1: Is the teacher busy?
    const teacherConflict = await this.prisma.routineEntry.findFirst({
      where: {
        teacherId: dto.teacherId,
        dayOfWeek: dto.dayOfWeek,
        slotId: dto.slotId,
        schoolId: schoolId,
      },
    });
    if (teacherConflict) {
      throw new BadRequestException(`Teacher is already assigned to another class at this time.`);
    }

    // Check 2: Is the room occupied?
    const roomConflict = await this.prisma.routineEntry.findFirst({
      where: {
        roomId: dto.roomId,
        dayOfWeek: dto.dayOfWeek,
        slotId: dto.slotId,
        schoolId: schoolId,
      },
    });
    if (roomConflict) {
      throw new BadRequestException(`Room is already occupied at this time.`);
    }
    
    // Check 3: Is the section already booked?
    const sectionConflict = await this.prisma.routineEntry.findFirst({
        where: {
            sectionId: dto.sectionId,
            dayOfWeek: dto.dayOfWeek,
            slotId: dto.slotId,
            schoolId: schoolId,
        }
    });
    if (sectionConflict) {
        throw new BadRequestException(`This section already has a class scheduled at this time.`);
    }
  }

  /**
   * Creates a new routine entry after validating for conflicts.
   * @param dto The data for the new routine entry.
   * @param schoolId The ID of the school.
   */
  async createRoutineEntry(dto: CreateRoutineEntryDto, schoolId: string) {
    await this.validateConflict(dto, schoolId);

    return this.prisma.routineEntry.create({
      data: {
        ...dto,
        schoolId: schoolId,
      },
    });
  }

  /**
   * Fetches the weekly routine for a specific section.
   * @param sectionId The ID of the section.
   */
   async getRoutineForSection(sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID '${sectionId}' not found.`);
    }

    return this.prisma.routineEntry.findMany({
      where: { sectionId: sectionId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { slot: { startTime: 'asc' } },
      ],
      include: {
        subject: {
          select: { name: true, code: true },
        },
        teacher: {
          select: { firstName: true, lastName: true },
        },
        room: {
          select: { name: true },
        },
        slot: {
          select: { startTime: true, endTime: true, type: true },
        },
      },
    });
  }

  /**
   * Fetches the weekly routine for a specific teacher, grouped by day.
   * @param teacherId The ID of the teacher (StaffProfile ID).
   */
  async getRoutineForTeacher(teacherId: string) {
    const routineEntries = await this.prisma.routineEntry.findMany({
      where: { teacherId: teacherId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { slot: { startTime: 'asc' } },
      ],
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
        subject: { select: { name: true, code: true } },
        room: { select: { name: true } },
        slot: { select: { startTime: true, endTime: true, type: true } },
      },
    });

    // Group by day of the week
    const groupedByDay = routineEntries.reduce((acc, entry) => {
      const day = entry.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(entry);
      return acc;
    }, {});

    return groupedByDay;
  }
}

