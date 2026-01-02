import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSyllabusLagReport(tenantId: string) {
    // Fetch all active curriculum plans with their topics and logs
    const plans = await this.prisma.curriculumPlan.findMany({
      where: { tenantId },
      include: {
        subject: true,
        class: true,
        chapters: {
          include: {
            topics: {
              include: {
                syllabusLogs: {
                  include: {
                    teacher: { select: { user: true } },
                    section: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const report: any[] = [];

    for (const plan of plans) {
      // Cast to any to bypass TS error if relation types are not fully inferred,
      // though include should work.
      // The issue might be that plan.chapters is not inferred correctly if Prisma types are stale.
      const chapters = (plan as any).chapters || [];
      const subjectName = (plan as any).subject?.name || 'Unknown Subject';
      const className = (plan as any).class?.name || 'Unknown Class';

      for (const chapter of chapters) {
        if (!chapter.targetCompletionDate) continue;

        for (const topic of chapter.topics) {
          for (const log of topic.syllabusLogs) {
            const lagDays = this.calculateLag(chapter.targetCompletionDate, log.completionDate);

            if (lagDays > 10) {
              const teacherName = log.teacher?.user ? `${log.teacher.user.firstName} ${log.teacher.user.lastName}` : 'Unknown Teacher';
              // 7.B.06 Pacing Guide Logic
              const classesNeeded = Math.ceil(topic.estimatedHours || 1);
              const suggestion = `Schedule ${classesNeeded} Extra Classes this week`;

              report.push({
                subject: subjectName,
                class: className,
                section: log.section.name,
                teacher: teacherName,
                topic: topic.name,
                targetDate: chapter.targetCompletionDate,
                completionDate: log.completionDate,
                lagDays,
                suggestion,
              });
            }
          }
        }
      }
    }

    return report;
  }

  private calculateLag(target: Date, actual: Date): number {
    const diffTime = actual.getTime() - target.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
