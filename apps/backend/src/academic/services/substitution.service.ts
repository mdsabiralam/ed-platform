import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubstitutionService {
  private readonly logger = new Logger(SubstitutionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAvailableTeachers(routineId: string, date: Date) {
    // 1. Get the routine details to know the time slot
    const targetRoutine = await this.prisma.routineEntry.findUnique({
      where: { id: routineId },
    });

    if (!targetRoutine) {
      throw new Error('Routine entry not found');
    }

    const { startTime, endTime, dayOfWeek } = targetRoutine; // Assuming routine has tenantId inferred from section->class->tenant? No, let's check schema.

    // RoutineEntry -> Section -> Class -> Tenant
    // We need tenantId to filter teachers of the SAME school.
    const routineWithTenant = await this.prisma.routineEntry.findUnique({
      where: { id: routineId },
      include: {
        section: {
          include: {
            class: true,
          }
        }
      }
    });

    if (!routineWithTenant) throw new Error('Routine not found');

    const tenantIdFromRoutine = routineWithTenant.section.class.tenantId;

    // 2. Fetch all teachers of this tenant
    const allTeachers = await this.prisma.staffProfile.findMany({
      where: {
        tenantId: tenantIdFromRoutine,
        // user: { isActive: true } // Assuming we might want to check user active status, but StaffProfile doesn't have it directly, User does.
        // For now, just get all staff profiles. Ideally filter by role if 'TEACHER' role exists in Profile but StaffProfile is just the details.
        // The prompt says "Find all teachers", implying StaffProfiles.
      },
    });

    const availableTeachers: typeof allTeachers = [];

    for (const teacher of allTeachers) {
      // 3. Exclude if they have a RoutineEntry at the same time
      const conflictingRoutine = await this.prisma.routineEntry.findFirst({
        where: {
          teacherId: teacher.id,
          dayOfWeek: dayOfWeek,
          // Check time overlap
          // (StartA <= EndB) and (EndA >= StartB)
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } }
          ]
        },
      });

      if (conflictingRoutine) continue;

      // 4. Exclude if on Approved Leave
      const onLeave = await this.prisma.leaveApplication.findFirst({
        where: {
          applicantId: teacher.id,
          status: 'APPROVED',
          startDate: { lte: date },
          endDate: { gte: date },
        },
      });

      if (onLeave) continue;

      // 5. Exclude if already substituting at this time
      // Find substitutions for this teacher on this date
      const activeSubstitution = await this.prisma.routineSubstitution.findFirst({
        where: {
          substituteTeacherId: teacher.id,
          date: date,
          status: { in: ['ASSIGNED', 'COMPLETED'] }, // Only if they are actually working
          routineEntry: {
             // Check if the routine they are subbing for overlaps with our target time
             AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: startTime } }
             ]
          }
        },
      });

      if (activeSubstitution) continue;

      availableTeachers.push(teacher);
    }

    return availableTeachers;
  }
}
