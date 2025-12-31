import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface ScheduleSlot {
  dayOfWeek: string;
  startTime: Date;
  endTime: Date;
}

@Injectable()
export class TimetableService {
  private readonly logger = new Logger(TimetableService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateRoutine(sectionId: string) {
    this.logger.log(`Generating routine for Section: ${sectionId}`);

    // 1. Fetch Section Details (to get Tenant)
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { class: true },
    });

    if (!section) throw new Error('Section not found');
    const tenantId = section.class.tenantId;

    // 2. Fetch Subjects and Teachers
    const subjects = await this.prisma.subject.findMany({
      where: { tenantId },
    });

    const teachers = await this.prisma.staffProfile.findMany({
      where: { tenantId, designation: 'TEACHER' }, // Assuming 'TEACHER' designation
    });

    if (subjects.length === 0 || teachers.length === 0) {
      throw new Error('Insufficient subjects or teachers to generate routine');
    }

    // 3. Define Slots (Mon-Fri, 09:00 - 15:00)
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const slots: ScheduleSlot[] = [];
    const START_HOUR = 9;
    const END_HOUR = 15;

    days.forEach((day) => {
      for (let h = START_HOUR; h < END_HOUR; h++) {
        const start = new Date();
        start.setHours(h, 0, 0, 0);
        const end = new Date();
        end.setHours(h + 1, 0, 0, 0);
        slots.push({ dayOfWeek: day, startTime: start, endTime: end });
      }
    });

    // 4. Clear existing routine for this section
    await this.prisma.routineEntry.deleteMany({
      where: { sectionId },
    });

    const routineEntries: any[] = [];

    // Helper to shuffle array
    const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

    // 5. Assign Subjects to Slots
    // Simple heuristic: Round-robin subjects, Random teacher
    // Constraint: No back-to-back Science

    let lastCategory = '';
    let lastDay = '';

    for (const slot of slots) {
      // Reset constraint on new day
      if (slot.dayOfWeek !== lastDay) {
        lastCategory = '';
        lastDay = slot.dayOfWeek;
      }

      // Filter valid subjects
      let validSubjects = subjects;
      if (lastCategory === 'SCIENCE') {
        validSubjects = subjects.filter((s) => s.category !== 'SCIENCE');
      }

      if (validSubjects.length === 0) {
        // Fallback: If only Science exists, we can't satisfy constraint.
        // Or pick any if strictness is loose. Let's try to pick from all if valid is empty (should not happen if we have mix).
         validSubjects = subjects;
      }

      const assignedSubject = shuffle(validSubjects)[0];
      const assignedTeacher = shuffle(teachers)[0]; // Ideally check teacher availability

      const entry = await this.prisma.routineEntry.create({
        data: {
          sectionId,
          teacherId: assignedTeacher.id,
          subjectId: assignedSubject.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        include: {
          subject: true,
          teacher: true,
        },
      });

      routineEntries.push(entry);
      lastCategory = assignedSubject.category;
    }

    return routineEntries;
  }
}
