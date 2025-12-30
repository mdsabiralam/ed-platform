import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DayOfWeek } from '@prisma/client';

@Injectable()
export class SubstitutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2, // For emitting events
  ) {}

  // "Step 3": Validate Teacher Availability
  async validateTeacherAvailability(teacherId: string, slotId: string, date: Date, tenantId: string): Promise<boolean> {
    const dayOfWeek = this.getDayOfWeek(date);

    // Check if the teacher has any routine entry at this slot on this day
    const conflict = await this.prisma.routineEntry.findFirst({
      where: {
        tenantId,
        teacherId,
        slotId,
        dayOfWeek,
      },
    });

    if (conflict) {
      return false; // Not free (has a regular class)
    }

    // Check if the teacher is already assigned as a substitute at this slot on this date
    const subConflict = await this.prisma.routineSubstitution.findFirst({
      where: {
        tenantId,
        substituteTeacherId: teacherId,
        date,
        routineEntry: {
          slotId,
        },
        status: { in: ['ASSIGNED', 'COMPLETED'] },
      },
    });

    if (subConflict) {
      return false; // Not free (already substituting)
    }

    return true;
  }

  // Step 4: Assign Substitute
  async assignSubstitute(tenantId: string, substitutionId: string, substituteTeacherId: string) {
    // 1. Get the substitution to know the slot/date
    const substitution = await this.prisma.routineSubstitution.findUnique({
      where: { id: substitutionId },
      include: { routineEntry: true },
    });

    if (!substitution) {
      throw new NotFoundException('Substitution request not found');
    }

    if (substitution.tenantId !== tenantId) {
       throw new BadRequestException('Invalid substitution ID for this school');
    }

    // 2. Validate availability
    const isFree = await this.validateTeacherAvailability(
      substituteTeacherId,
      substitution.routineEntry.slotId,
      substitution.date,
      tenantId,
    );

    if (!isFree) {
      throw new BadRequestException('Substitute teacher is not available at this slot.');
    }

    // 3. Update RoutineSubstitution
    const updated = await this.prisma.routineSubstitution.update({
      where: { id: substitutionId },
      data: {
        substituteTeacherId,
        status: 'ASSIGNED',
      },
    });

    // 4. Emit event
    this.eventEmitter.emit('substitution.assigned', {
      tenantId,
      substitutionId: updated.id,
      substituteTeacherId: updated.substituteTeacherId,
      date: updated.date,
    });

    return updated;
  }

  // Step 5: Get Pending Substitutions
  async getPendingSubstitutions(tenantId: string) {
    return this.prisma.routineSubstitution.findMany({
      where: {
        tenantId,
        status: 'PENDING',
      },
      include: {
        routineEntry: {
          include: {
            class: true,
            section: true,
            subject: true,
            originalTeacher: true,
            slot: true,
          },
        },
      },
    });
  }

  // Helper to get DayOfWeek enum from Date
  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  }
}
