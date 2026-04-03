import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssignmentAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getHomeworkCompliance(classId: string, sectionId?: string) {
    // 1. Fetch Students
    const students = await this.prisma.student.findMany({
      where: {
        section: {
          classId: classId,
          ...(sectionId ? { id: sectionId } : {}),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNo: true,
      },
    });

    // 2. Fetch Assignments for this scope
    // Assignments are linked to Class and optionally Section.
    // We want assignments that apply to these students.
    // If an assignment has a sectionId, it applies only to that section.
    // If it has no sectionId, it applies to the whole class.
    const assignments = await this.prisma.assignment.findMany({
      where: {
        classId: classId,
        ...(sectionId ? { OR: [{ sectionId: null }, { sectionId: sectionId }] } : {}),
      },
      select: { id: true, dueDate: true, sectionId: true },
    });

    const atRiskStudents: any[] = [];

    for (const student of students) {
      // Filter assignments relevant to this specific student
      // (If we fetched generally for class, some assignments might be for other sections)
      // But we already filtered `assignments` query based on the scope provided.
      // However, if sectionId was NOT provided in function arg (class-wide report),
      // we need to check if the assignment is applicable to the student's section.
      // But for simplicity/MVP, let's assume if we run for a Class, we check all applicable assignments.
      // Actually, precise logic: Student belongs to Section S. Assignment A is for Class C.
      // A applies if A.sectionId is NULL or A.sectionId == S.id.
      // Since we don't have student's section ID loaded above easily for every row (unless we include it),
      // let's re-fetch or optimize.

      // Optimization: Get student's section ID.
      const studentSection = await this.prisma.student.findUnique({
          where: { id: student.id },
          select: { sectionId: true }
      });

      const applicableAssignments = assignments.filter(a =>
          a.sectionId === null || a.sectionId === studentSection?.sectionId
      );

      const totalAssignments = applicableAssignments.length;
      if (totalAssignments === 0) continue; // No compliance to check

      // 3. Count Submissions
      const submissions = await this.prisma.assignmentSubmission.findMany({
        where: {
          studentId: student.id,
          assignmentId: { in: applicableAssignments.map(a => a.id) },
        },
        select: {
          submittedAt: true,
          assignment: { select: { dueDate: true } },
        },
      });

      // Calculate on-time submissions
      // "On time" means submittedAt <= dueDate (if dueDate exists)
      const onTimeCount = submissions.filter(sub => {
        if (!sub.assignment.dueDate) return true; // No deadline = on time
        return sub.submittedAt <= sub.assignment.dueDate;
      }).length;

      const compliancePercentage = (onTimeCount / totalAssignments) * 100;

      if (compliancePercentage < 50) {
        atRiskStudents.push({
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          admissionNo: student.admissionNo,
          compliancePercentage: parseFloat(compliancePercentage.toFixed(2)),
          totalAssignments,
          onTimeSubmissions: onTimeCount,
        });
      }
    }

    return atRiskStudents;
  }
}
