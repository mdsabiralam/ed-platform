import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SubstitutionListener {
  private readonly logger = new Logger(SubstitutionListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('substitution.assigned')
  async handleSubstitutionAssigned(payload: { substitutionId: string; substituteTeacherId: string; date: Date }) {
    const { substitutionId, substituteTeacherId } = payload;

    const sub = await this.prisma.routineSubstitution.findUnique({
      where: { id: substitutionId },
      include: {
        routineEntry: { include: { class: true, section: true, subject: true } },
        originalTeacher: true,
        substituteTeacher: true,
      },
    });

    if (!sub) return;

    const details = `${sub.routineEntry.class.name} ${sub.routineEntry.section.name} - ${sub.routineEntry.subject.name}`;

    // 1. Notify Substitute
    this.logger.log(
      `[PUSH] To ${sub.substituteTeacher?.firstName} (Sub): New Duty: You have been assigned ${details} on ${sub.date.toDateString()}.`,
    );

    // 2. Notify Original Teacher
    this.logger.log(
      `[PUSH] To ${sub.originalTeacher.firstName} (Original): Your class ${details} has been covered by ${sub.substituteTeacher?.firstName}.`,
    );
  }
}
