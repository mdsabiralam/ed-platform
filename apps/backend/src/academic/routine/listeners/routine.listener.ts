import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RoutineListener {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('routine.completed')
  async handleRoutineCompleted(payload: { routineId: string; curriculumPlanId?: string; tenantId: string }) {
    if (!payload.curriculumPlanId) return;

    await this.prisma.curriculumPlan.update({
      where: { id: payload.curriculumPlanId },
      data: {
        status: 'COMPLETED',
        actualCompletionDate: new Date(),
      },
    });
    console.log(`[Syllabus Tracker] Marked Curriculum Plan ${payload.curriculumPlanId} as COMPLETED.`);
  }
}
