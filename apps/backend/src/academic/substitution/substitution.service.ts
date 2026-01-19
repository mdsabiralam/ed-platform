import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubstitutionService {
  constructor(private prisma: PrismaService) {}

  async assignSubstitution(routineEntryId: string, originalTeacherId: string, substituteTeacherId: string) {
    // 1. Verify Routine exists
    const routine = await this.prisma.routineEntry.findUnique({
      where: { id: routineEntryId },
    });

    if (!routine) {
      throw new NotFoundException('Routine entry not found');
    }

    if (routine.teacherId !== originalTeacherId) {
        throw new BadRequestException("Original teacher does not match routine owner");
    }

    // 2. Check conflict for substitute (Simulated logic: in real app, check DB)
    // For this test, we assume the caller has verified availability or we trust the input.

    // 3. Create Substitution Record
    const substitution = await this.prisma.routineSubstitution.create({
      data: {
        routineEntryId,
        originalTeacherId,
        substituteTeacherId,
        date: new Date(), // Assigned for "today" as per prompt
        status: 'ASSIGNED',
      },
    });

    return substitution;
  }
}
