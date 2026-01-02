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

  /**
   * 7.B.08 Compare Parallel Sections
   * Identifies if one section is falling behind others.
   */
  async compareSections(tenantId: string, classId: string, subjectId: string) {
    // Fetch all sections for the class
    // Prisma Section where input does not usually include tenantId directly if it's not on the model,
    // but the schema says Section has tenantId (mapped to school_id)?
    // Checking schema: Section has classId, but schema posted earlier did NOT show tenantId on Section explicitly (only on Class).
    // Wait, let's check schema again. Section -> class -> tenant.
    // So filter by classId is enough if we trust the input, but for safety:
    // where: { classId, class: { tenantId } }

    const sections = await this.prisma.section.findMany({
      where: {
        classId,
        class: { tenantId }
      },
      select: { id: true, name: true },
    });

    const comparison: any[] = [];

    // Fetch Syllabus Status for each section (Reusing logic would be ideal, but for now aggregating directly)
    // We need completion % per section.
    // Optimization: We could fetch all logs for the subject/class in one go and aggregate in memory.

    // Fetch Plan for the subject/class
    const plan = await this.prisma.curriculumPlan.findFirst({
      where: { tenantId, classId, subjectId },
      orderBy: { version: 'desc' },
      include: {
        chapters: {
          include: {
            topics: true,
          },
        },
      },
    });

    if (!plan) return { message: 'No curriculum plan found', data: [] };

    const totalTopics = plan.chapters.reduce((sum, ch) => sum + ch.topics.length, 0);

    for (const section of sections) {
      const logs = await this.prisma.syllabusLog.findMany({
        where: {
          tenantId,
          sectionId: section.id,
          topic: { chapter: { planId: plan.id } },
        },
      });

      const completedCount = logs.length; // Assuming 1 log per topic per section implies completion
      const percentage = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

      // Calculate avg lag
      let totalLag = 0;
      let laggedTopicsCount = 0;

      // We need to map logs to topics to get target dates
      // This is slightly inefficient N*M loop, but N (logs) is small per term.
      for (const log of logs) {
         // Find topic in plan
         const topic = plan.chapters.flatMap(c => c.topics.map(t => ({...t, targetDate: c.targetCompletionDate}))).find(t => t.id === log.topicId);
         if (topic && topic.targetDate) {
             const lag = this.calculateLag(topic.targetDate, log.completionDate);
             totalLag += lag;
             laggedTopicsCount++;
         }
      }

      const avgLag = laggedTopicsCount > 0 ? (totalLag / laggedTopicsCount) : 0;

      comparison.push({
        sectionId: section.id,
        sectionName: section.name,
        completionPercentage: parseFloat(percentage.toFixed(2)),
        avgLagDays: parseFloat(avgLag.toFixed(1)),
      });
    }

    // Sort by completion ascending (slowest first)
    comparison.sort((a, b) => a.completionPercentage - b.completionPercentage);

    return comparison;
  }
}
