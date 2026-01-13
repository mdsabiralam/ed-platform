import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrincipalService {
  constructor(private readonly prisma: PrismaService) {}

  async getClassPerformance(classId: string, examTermId: string) {
    // Calculate subject-wise averages for the class
    const subjects = await this.prisma.subject.findMany({
      where: {
        exams: {
          some: {
            classId: classId,
            examTermId: examTermId,
          },
        },
      },
      include: {
        exams: {
          where: {
            classId: classId,
            examTermId: examTermId,
          },
          include: {
            marks: true,
          },
        },
      },
    });

    const performance = subjects.map((subject) => {
      // Assuming one exam per subject per term per class (usually true)
      // Or aggregate if multiple exams
      const exam = subject.exams[0];
      if (!exam || exam.marks.length === 0) {
        return {
          subjectName: subject.name,
          average: 0,
        };
      }

      const totalMarks = exam.marks.reduce((sum, mark) => sum + mark.total, 0);
      const average = totalMarks / exam.marks.length;

      return {
        subjectName: subject.name,
        average: parseFloat(average.toFixed(2)),
      };
    });

    return performance;
  }

  async getWeakStudents(classId: string, examTermId: string, failCountThreshold: number = 2) {
    // Identify students who failed in > failCountThreshold subjects
    // Need pass criteria. Assuming < 33% is fail for now or checks grade.
    // Let's assume < 33% of maxMarks (stored in exam) is fail.

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
            exam: true,
          },
        },
      },
    });

    const weakStudents: any[] = [];

    for (const student of students) {
      let failedSubjects = 0;
      for (const mark of student.marks) {
        const passMarks = mark.exam.maxMarks * 0.33; // 33% passing
        if (mark.total < passMarks) {
          failedSubjects++;
        }
      }

      if (failedSubjects > failCountThreshold) {
        weakStudents.push({
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          failedSubjectsCount: failedSubjects,
        });
      }
    }

    return weakStudents;
  }
}
