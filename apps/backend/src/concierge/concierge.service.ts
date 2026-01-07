import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConciergeRequestDto } from './dto/create-concierge-request.dto';
import { UpdateConciergeRequestDto } from './dto/update-concierge-request.dto';
import { PublishRequestDto } from './dto/publish-request.dto';
import { ClsService } from 'nestjs-cls';
import { RequestStatus } from '@prisma/client';
import { AssignmentService } from '../assignment/assignment.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class ConciergeService {
  constructor(
    private prisma: PrismaService,
    private cls: ClsService,
    private assignmentService: AssignmentService,
    private notificationService: NotificationService
  ) {}

  async publish(id: string, dto: PublishRequestDto) {
    const instituteId = this.cls.get('instituteId');

    // 1. Validate Request Exists
    const request = await this.prisma.conciergeRequest.findFirst({
      where: { id, instituteId }
    });
    if (!request) throw new NotFoundException('Request not found');

    // 2. Create Assignment
    const assignment = await this.assignmentService.createFromRequest(id, dto, instituteId);

    // 3. Update Request Status
    await this.prisma.conciergeRequest.update({
      where: { id },
      data: { status: RequestStatus.PUBLISHED }
    });

    // 4. Notify Students (Mock fetch students in class)
    // const students = await this.prisma.student.findMany({ where: { classId: dto.classId } });
    // const userIds = students.map(s => s.userId).filter(id => id !== null) as string[];
    // await this.notificationService.sendBulkNotification(userIds, `New Assignment: ${dto.title}`);

    // Mock notification for now
    await this.notificationService.sendBulkNotification([], `New Assignment Published: ${dto.title}`);

    return assignment;
  }

  async create(dto: CreateConciergeRequestDto, teacherUserId: string) {
    const instituteId = this.cls.get('instituteId');

    // Resolve teacher staff profile from userId
    const staffProfile = await this.prisma.staffProfile.findUnique({
      where: { userId: teacherUserId }
    });

    if (!staffProfile) {
        throw new NotFoundException('Staff profile not found for user');
    }

    return this.prisma.conciergeRequest.create({
      data: {
        instituteId,
        teacherId: staffProfile.id,
        ...dto,
      }
    });
  }

  async findAll(status?: RequestStatus) {
     const instituteId = this.cls.get('instituteId');

     return this.prisma.conciergeRequest.findMany({
       where: {
         instituteId,
         ...(status ? { status } : {})
       },
       include: {
         teacher: {
             include: { user: { select: { email: true, phone: true } } }
         },
         assignedStaff: true,
         assignments: true
       },
       orderBy: { createdAt: 'desc' }
     });
  }

  async update(id: string, dto: UpdateConciergeRequestDto) {
      const instituteId = this.cls.get('instituteId');

      const request = await this.prisma.conciergeRequest.findFirst({
        where: { id, instituteId }
      });

      if (!request) {
        throw new NotFoundException(`Concierge request with ID ${id} not found`);
      }

      return this.prisma.conciergeRequest.update({
          where: { id },
          data: dto
      });
  }

  async getRequest(id: string) {
    const instituteId = this.cls.get('instituteId');
    return this.prisma.conciergeRequest.findFirst({
      where: { id, instituteId },
      include: {
         teacher: {
             include: { user: { select: { email: true, phone: true } } }
         },
         assignedStaff: true,
         assignments: true
       }
    });
  }
}
