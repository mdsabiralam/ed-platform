import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignSubstituteDto } from './dto/assign-substitute.dto';

@Injectable()
export class SubstitutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findPending(tenantId: string) {
    return this.prisma.routineSubstitution.findMany({
      where: {
        status: 'PENDING',
        routineEntry: {
          schoolId: tenantId,
        },
      },
      include: {
        routineEntry: {
          include: {
            class: true,
            section: true,
            subject: true,
          },
        },
        originalTeacher: true,
      },
    });
  }

  async assignSubstitute(dto: AssignSubstituteDto) {
    const { substitutionId, substituteTeacherId } = dto;

    // 1. Fetch Substitution
    const substitution = await this.prisma.routineSubstitution.findUnique({
      where: { id: substitutionId },
      include: { routineEntry: { include: { slot: true } } },
    });

    if (!substitution) {
      throw new NotFoundException('Substitution request not found');
    }

    // 2. Check if Teacher is Free (Step 3 Logic)
    const isFree = await this.isTeacherFree(
      substituteTeacherId,
      substitution.date,
      substitution.routineEntry.slotId, // Assuming slotId is what defines time
      substitution.routineEntry.dayOfWeek,
    );

    if (!isFree) {
      throw new BadRequestException('Teacher is not free at this time');
    }

    // 3. Update Substitution
    const updated = await this.prisma.routineSubstitution.update({
      where: { id: substitutionId },
      data: {
        substituteTeacherId,
        status: 'ASSIGNED',
      },
    });

    // 4. Emit Event
    this.eventEmitter.emit('substitution.assigned', {
      substitutionId: updated.id,
      substituteTeacherId,
      date: updated.date,
    });

    return updated;
  }

  /**
   * Checks if a teacher is free at a specific date/time.
   */
  async isTeacherFree(teacherId: string, date: Date, slotId: string, dayOfWeek: any): Promise<boolean> {
    // A. Check for Regular Routine Conflicts
    // Find routine entries for this teacher on this dayOfWeek & slot
    const routineConflict = await this.prisma.routineEntry.findFirst({
      where: {
        teacherId,
        dayOfWeek, // Enum match
        slotId,
      },
    });

    // If there is a routine, check if THEY requested substitution for it (if so, they are technically free, but logic might vary)
    // For simplicity: If they have a class, they are busy unless that class is substituted.
    // If routineConflict exists, check if there's a substitution for it on this date.
    if (routineConflict) {
        const sub = await this.prisma.routineSubstitution.findFirst({
            where: {
                routineEntryId: routineConflict.id,
                date: date,
                // If status is ASSIGNED, someone else is taking it?
                // Or if it exists at all, it means the teacher is "absent" from it.
                // Assuming existence means they are absent.
            }
        });
        if (!sub) return false; // They have a class and no sub, so busy.
    }

    // B. Check for Substitution Conflicts (Are they already subbing elsewhere?)
    const subConflict = await this.prisma.routineSubstitution.findFirst({
      where: {
        substituteTeacherId: teacherId,
        date: date,
        routineEntry: {
            slotId: slotId
        }
      },
    });

    if (subConflict) return false;

    return true;
  }
}
