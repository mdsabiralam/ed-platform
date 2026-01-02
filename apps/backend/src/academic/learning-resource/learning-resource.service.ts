import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';

@Injectable()
export class LearningResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLearningResourceDto) {
    return this.prisma.learningResource.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        url: dto.url,
        thumbnailUrl: dto.thumbnailUrl,
        chapter: { connect: { id: dto.chapterId } },
        topic: { connect: { id: dto.topicId } },
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async findAllByTopic(topicId: string) {
    return this.prisma.learningResource.findMany({
      where: { topicId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
