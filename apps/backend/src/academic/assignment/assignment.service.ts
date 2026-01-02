import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlagiarismCheckService } from './plagiarism-check.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AssignmentService {
  constructor(
    private prisma: PrismaService,
    private plagiarismCheckService: PlagiarismCheckService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getSubmission(submissionId: string) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        student: { include: { user: true } },
        assignment: true,
      },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    return submission;
  }

  async saveFeedback(submissionId: string, teacherFeedback: string, obtainedMarks: number) {
    const submission = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        teacherFeedback,
        obtainedMarks,
        status: 'GRADED',
      },
    });

    // Trigger notification
    this.eventEmitter.emit('submission.graded', { submissionId });

    return submission;
  }

  async saveAudioFeedback(submissionId: string, fileUrl: string) {
    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        audioFeedbackUrl: fileUrl,
      },
    });
  }

  async saveAnnotations(submissionId: string, annotations: any) {
    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        annotationsJson: annotations,
      },
    });
  }

  async requestResubmission(submissionId: string, remarks: string) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { student: { include: { user: true } } },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const updatedSubmission = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'REDO_REQUESTED',
        teacherFeedback: remarks, // Append or overwrite? Using overwrite as per simple logic, or append if needed.
      },
    });

    // Notify student logic (Mocked)
    if (submission.student?.user?.email) {
      console.log(`Notification: Sent REDO_REQUESTED to student ${submission.student.user.email} for submission ${submissionId}. Remarks: ${remarks}`);
    }

    return updatedSubmission;
  }

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    content?: string,
    fileUrl?: string,
  ) {
    // Check if assignment exists
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Upsert submission: create if new, update if exists (re-submission)
    // If status was REDO_REQUESTED, it will be updated to SUBMITTED again implicitly or explicitly.
    // We should reset status to SUBMITTED on re-submission.
    const plagiarismScore = content ? this.plagiarismCheckService.checkSimilarity(content) : null;

    const submission = await this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        content,
        fileUrl,
        submittedAt: new Date(),
        status: 'SUBMITTED', // Reset status on re-submission
        plagiarismScore,
      },
      create: {
        assignmentId,
        studentId,
        content,
        fileUrl,
        status: 'SUBMITTED',
        plagiarismScore,
      },
    });

    return submission;
  }

  async getFeaturedSubmissions(assignmentId: string) {
    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: {
        assignmentId,
        isFeatured: true,
      },
      include: {
        student: true,
      },
    });

    // Map to a cleaner DTO if needed, but returning raw Prisma result is fine for now
    // Flattening student name could be helpful for frontend
    return submissions.map(sub => ({
      ...sub,
      studentName: sub.student ? `${sub.student.firstName || ''} ${sub.student.lastName || ''}`.trim() : 'Unknown Student',
    }));
  }
}
