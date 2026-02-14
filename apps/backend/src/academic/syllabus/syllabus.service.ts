import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SyllabusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(classId: string, subjectId: string) {
    const plan = await this.prisma.curriculumPlan.findFirst({
      where: { classId, subjectId },
      include: { lessons: true },
    });

    if (!plan) throw new NotFoundException('Curriculum Plan not found');

    const completed = plan.lessons.filter((l) => l.status === 'COMPLETED').length;
    const progress = (completed / plan.totalLessons) * 100;

    return {
      chapterName: plan.chapterName,
      progress,
      status: plan.status,
      actualCompletionDate: plan.actualCompletionDate,
    };
  }

  @OnEvent('routine.completed')
  async handleRoutineCompleted(payload: { routineId: string }) {
    // 1. Find Lesson Plan linked to this routine
    const lesson = await this.prisma.lessonPlan.findFirst({
      where: { routineEntryId: payload.routineId },
      include: { curriculumPlan: true },
    });

    if (!lesson) return; // No lesson linked

    // 2. Mark Lesson Completed
    await this.prisma.lessonPlan.update({
      where: { id: lesson.id },
      data: {
        status: 'COMPLETED',
        completionDate: new Date(),
      },
    });

    // 3. Check Curriculum Plan progress
    const plan = lesson.curriculumPlan;
    const allLessons = await this.prisma.lessonPlan.findMany({
      where: { curriculumPlanId: plan.id },
    });

    const allCompleted = allLessons.every((l) => l.status === 'COMPLETED' || l.id === lesson.id);

    if (allCompleted) {
      await this.prisma.curriculumPlan.update({
        where: { id: plan.id },
        data: {
          status: 'COMPLETED',
          actualCompletionDate: new Date(),
        },
      });
    }
  }
}
