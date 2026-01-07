import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConciergeRequestDto } from './dto/create-concierge-request.dto';
import { UpdateConciergeRequestDto } from './dto/update-concierge-request.dto';

@Injectable()
export class ConciergeService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      if (status === 'PENDING_OR_PROCESSING') {
        where.status = { in: ['PENDING', 'PROCESSING'] };
      } else {
        where.status = status;
      }
    }

    return this.prisma.conciergeRequest.findMany({
      where,
      include: {
        teacher: {
          select: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        staff: {
          select: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { receivedAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.conciergeRequest.findUnique({
      where: { id },
      include: {
         teacher: {
          select: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
    if (!request) throw new NotFoundException(`Concierge Request with ID ${id} not found`);
    return request;
  }

  async create(data: CreateConciergeRequestDto) {
    return this.prisma.conciergeRequest.create({
      data
    });
  }

  async assignStaff(id: string, staffId: string) {
    return this.prisma.conciergeRequest.update({
      where: { id },
      data: {
        staffId,
        status: 'PROCESSING'
      }
    });
  }

  async publish(id: string, content: any) {
    const request = await this.prisma.conciergeRequest.update({
      where: { id },
      data: {
        content,
        status: 'COMPLETED'
      }
    });

    // Mock Notification trigger
    console.log(`Notification sent to teacher ${request.teacherId} for request ${id}`);

    return request;
  }

  async autoGenerate(id: string) {
    const request = await this.findOne(id);
    // Mock AI Generation based on rawImageUrl or subject
    const generatedContent = {
      title: `${request.subject} Assignment`,
      description: "Auto-generated description based on the uploaded image.",
      questions: [
        { q: "Question 1 extracted from image", a: "Answer 1" },
        { q: "Question 2 extracted from image", a: "Answer 2" }
      ]
    };
    return generatedContent;
  }
}
