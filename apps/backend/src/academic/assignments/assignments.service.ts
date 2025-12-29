import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto, SubmitAssignmentDto } from './dto/assignment.dto';
import { SubmissionStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AssignmentService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async createAssignment(dto: CreateAssignmentDto) {
    // Validate dueDate
    const dueDate = new Date(dto.dueDate);
    if (dueDate <= new Date()) {
        throw new BadRequestException('Due date must be in the future');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dueDate,
        maxMarks: dto.maxMarks,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
        attachmentUrls: dto.attachmentUrls || [],
        isPublished: dto.isPublished ?? false,
      },
    });

    // Trigger Notification Event
    this.eventEmitter.emit('assignment.created', assignment);

    return assignment;
  }

  async submitAssignment(assignmentId: string, dto: SubmitAssignmentDto) {
      const assignment = await this.prisma.assignment.findUnique({
          where: { id: assignmentId }
      });
      if (!assignment) throw new BadRequestException('Assignment not found');

      const now = new Date();
      let status: SubmissionStatus = SubmissionStatus.SUBMITTED;
      if (now > assignment.dueDate) {
          status = SubmissionStatus.LATE;
      }

      // Check if already submitted
      const existing = await this.prisma.assignmentSubmission.findUnique({
          where: {
              studentId_assignmentId: {
                  studentId: dto.studentId,
                  assignmentId: assignmentId
              }
          }
      });

      if (existing) {
          return this.prisma.assignmentSubmission.update({
              where: { id: existing.id },
              data: {
                  fileUrls: dto.fileUrls,
                  submittedAt: now,
                  status: status
              }
          });
      }

      return this.prisma.assignmentSubmission.create({
          data: {
              studentId: dto.studentId,
              assignmentId: assignmentId,
              fileUrls: dto.fileUrls || [],
              submittedAt: now,
              status: status
          }
      });
  }
}
