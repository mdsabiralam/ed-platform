import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { ResultService } from '../services/result.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FinanceService } from '../services/finance-mock.service';
import { SubjectAnalyticsService } from '../services/subject-analytics.service';

@Processor('result-calculation')
export class ResultCalculationProcessor {
  constructor(
    private readonly resultService: ResultService,
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
    private readonly analyticsService: SubjectAnalyticsService,
  ) {}

  @Process('process-term-results')
  async handleCalculation(job: any) {
    const { examTermId, classId, tenantId } = job.data;

    const log = await this.prisma.calculationLog.create({
        data: {
            examTermId,
            status: 'PROCESSING',
            startedAt: new Date(),
        }
    });

    try {
        let studentIds: string[] = [];

        if (classId) {
            const students = await this.prisma.student.findMany({
                where: {
                    section: { classId },
                    tenantId
                },
                select: { id: true }
            });
            studentIds = students.map(s => s.id);
        } else {
            const marks = await this.prisma.studentMark.findMany({
                where: {
                    exam: { examTermId: examTermId }
                },
                select: { studentId: true },
                distinct: ['studentId']
            });
            studentIds = marks.map(m => m.studentId);
        }

        let processed = 0;
        for (const studentId of studentIds) {
            const marks = await this.prisma.studentMark.findMany({
                where: {
                    studentId,
                    exam: { examTermId }
                },
                include: { exam: true }
            });

            const normalizedMarks = marks.map(m => {
                const max = m.exam.maxTheory + m.exam.maxPractical;
                const obtained = m.totalMarks;
                if (max === 0) return 0;
                return (obtained / max) * 100;
            });

            const bestOf5 = this.resultService.calculateBestOfFive(normalizedMarks, 100);

            // 6.E.09 Promotion Logic
            let failCount = 0;
            for (const m of marks) {
                const isPassed = this.resultService.checkPassCriteria(
                    m.theoryMarks,
                    m.practicalMarks,
                    m.exam.maxTheory,
                    m.exam.maxPractical
                );
                if (!isPassed) failCount++;
            }
            let status = this.resultService.determinePromotionStatus(failCount);

            // 6.E.07 Check Fees
            const isFeesPaid = await this.financeService.checkFeeStatus(studentId);
            if (!isFeesPaid) status = 'WITHHELD';

            await this.prisma.resultSummary.upsert({
                where: {
                    studentId_examTermId: { studentId, examTermId }
                },
                update: {
                    totalMarks: bestOf5.totalMarks,
                    percentage: bestOf5.percentage,
                    resultStatus: status,
                    calculatedAt: new Date()
                },
                create: {
                    studentId,
                    examTermId,
                    totalMarks: bestOf5.totalMarks,
                    percentage: bestOf5.percentage,
                    resultStatus: status as any, // Cast to enum
                    classRank: 0,
                    sectionRank: 0
                }
            });
            processed++;

            if (processed % 10 === 0) {
                await this.prisma.calculationLog.update({
                    where: { id: log.id },
                    data: { processedCount: processed }
                });
            }
        }

        await this.resultService.calculateRanks(examTermId);

        // 6.E.08 Subject Analytics
        const termExams = await this.prisma.exam.findMany({ where: { examTermId } });
        for (const exam of termExams) {
            await this.analyticsService.calculateAndStore(exam.id);
        }

        await this.prisma.calculationLog.update({
            where: { id: log.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                processedCount: processed
            }
        });

    } catch (e: any) {
        await this.prisma.calculationLog.update({
            where: { id: log.id },
            data: {
                status: 'FAILED',
                completedAt: new Date(),
                errorLog: { message: e.message, stack: e.stack }
            }
        });
    }
  }
}
