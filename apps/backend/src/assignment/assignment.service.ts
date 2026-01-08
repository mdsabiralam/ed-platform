import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  async create(requestId: string, data: any) {
    const { title, description, dueDate, questions } = data;

    // Create assignment and update request status to COMPLETED
    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          requestId,
          title,
          description,
          dueDate: new Date(dueDate),
          questions,
        },
      });

      await tx.conciergeRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      });

      return assignment;
    });
  }
}
