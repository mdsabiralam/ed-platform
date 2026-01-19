import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateHomeworkDto } from './homework.dto';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async createHomework(dto: CreateHomeworkDto) {
    // Convert DTO attachments to JSON-compatible format
    const attachmentsJson = JSON.parse(JSON.stringify(dto.attachments));

    return this.prisma.homework.create({
      data: {
        title: dto.title,
        description: dto.description,
        sectionId: dto.sectionId,
        deadline: new Date(dto.deadline),
        attachments: attachmentsJson,
      },
    });
  }
}
