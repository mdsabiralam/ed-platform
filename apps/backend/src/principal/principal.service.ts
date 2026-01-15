import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrincipalService {
  constructor(private prisma: PrismaService) {}

  async getClassPerformance(classId: string, examTermId: string) {
    if (!classId || !examTermId) {
      throw new Error('classId and examTermId are required');
    }

    // 1. Fetch all students in the class with their marks for the specific term
    const students = await this.prisma.student.findMany({
      where: {
        section: {
          classId: classId,
        },
      },
      include: {
        marks: {
          where: {
            exam: {
              examTermId: examTermId,
            },
          },
          include: {
            exam: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!students || students.length === 0) {
      return {
        class_average: 0,
        highest_score: 0,
        lowest_score: 0,
        subject_wise_averages: [],
      };
    }

    // 2. Process data to calculate aggregates
    let totalClassPercentage = 0;
    let highestPercentage = -1;
    let lowestPercentage = 101;
    const subjectStats: Record<string, { totalPercentage: number; count: number; name: string }> = {};

    let studentCountWithMarks = 0;

    for (const student of students) {
      const marks = student.marks || [];
      if (marks.length === 0) continue;

      let studentTotalObtained = 0;
      let studentTotalMax = 0;

      for (const mark of marks) {
        // Calculate student totals
        const obtained = (mark.theoryMarks || 0) + (mark.practicalMarks || 0);
        const max = (mark.exam.maxTheory || 0) + (mark.exam.maxPractical || 0);

        studentTotalObtained += obtained;
        studentTotalMax += max;

        // Subject wise aggregation
        const subjectId = mark.exam.subjectId;
        const subjectName = mark.exam.subject.name;

        if (!subjectStats[subjectId]) {
          subjectStats[subjectId] = { totalPercentage: 0, count: 0, name: subjectName };
        }

        if (max > 0) {
          const percentage = (obtained / max) * 100;
          subjectStats[subjectId].totalPercentage += percentage;
          subjectStats[subjectId].count += 1;
        }
      }

      if (studentTotalMax > 0) {
        const studentPercentage = (studentTotalObtained / studentTotalMax) * 100;
        totalClassPercentage += studentPercentage;

        if (studentPercentage > highestPercentage) highestPercentage = studentPercentage;
        if (studentPercentage < lowestPercentage) lowestPercentage = studentPercentage;

        studentCountWithMarks++;
      }
    }

    if (studentCountWithMarks === 0) {
        return {
            class_average: 0,
            highest_score: 0,
            lowest_score: 0,
            subject_wise_averages: [],
        };
    }

    const classAverage = totalClassPercentage / studentCountWithMarks;

    const subjectWiseAverages = Object.values(subjectStats).map((stat) => ({
      subject: stat.name,
      average: stat.count > 0 ? stat.totalPercentage / stat.count : 0,
    }));

    return {
      class_average: Number(classAverage.toFixed(2)),
      highest_score: Number(highestPercentage.toFixed(2)),
      lowest_score: Number(lowestPercentage.toFixed(2)),
      subject_wise_averages: subjectWiseAverages.map(s => ({
          subject: s.subject,
          average: Number(s.average.toFixed(2))
      })),
    };
  }

  async getWeakStudents(classId: string, examTermId: string, passPercentage: number = 33) {
    if (!classId || !examTermId) {
      throw new Error('classId and examTermId are required');
    }

    const students = await this.prisma.student.findMany({
      where: {
        section: {
          classId: classId,
        },
      },
      include: {
        marks: {
          where: {
            exam: {
              examTermId: examTermId,
            },
          },
          include: {
            exam: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    const weakStudents = [];

    for (const student of students) {
      let failedSubjectsCount = 0;
      const failedSubjects = [];

      for (const mark of student.marks) {
        const totalMarks = (mark.theoryMarks || 0) + (mark.practicalMarks || 0);
        const maxMarks = (mark.exam.maxTheory || 0) + (mark.exam.maxPractical || 0);

        if (maxMarks > 0) {
          const percentage = (totalMarks / maxMarks) * 100;
          if (percentage < passPercentage) {
            failedSubjectsCount++;
            failedSubjects.push({
              subject: mark.exam.subject.name,
              score: totalMarks,
              maxScore: maxMarks,
            });
          }
        }
      }

      if (failedSubjectsCount > 2) {
        weakStudents.push({
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          admissionNo: student.admissionNo,
          failedSubjectsCount,
          failedSubjects,
        });
      }
    }

    return weakStudents;
  }
}
