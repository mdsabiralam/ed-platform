import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublishRequestDto } from '../concierge/dto/publish-request.dto'; // Importing DTO from concierge as it's used there

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  async createFromRequest(requestId: string, dto: PublishRequestDto, instituteId: string) {
    return this.prisma.assignment.create({
      data: {
        instituteId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        classId: dto.classId,
        conciergeRequestId: requestId,
      }
    });
  }
}
