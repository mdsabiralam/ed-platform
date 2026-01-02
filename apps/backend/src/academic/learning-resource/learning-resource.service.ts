import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { StorageService } from '../../shared/storage.service';

@Injectable()
export class LearningResourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

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
    const resources = await this.prisma.learningResource.findMany({
      where: { topicId },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      resources.map(async (resource) => {
        if (resource.type === 'PDF' || resource.type === 'AUDIO') {
          return {
            ...resource,
            url: await this.storageService.getPresignedUrl(resource.url),
          };
        }
        return resource;
      }),
    );
  }

  async trackView(studentId: string, resourceId: string) {
    return this.prisma.studentActivityLog.create({
      data: {
        studentId,
        resourceId,
        action: 'VIEW',
      },
    });
  }

  async getRecommendedResources(studentId: string) {
    // 1. Fetch recent quiz submissions
    const submissions = await this.prisma.onlineExamSubmission.findMany({
      where: { studentId },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    });

    // 2. Identify weak topics (< 50% accuracy)
    const topicStats: Record<string, { correct: number; total: number }> = {};

    submissions.forEach((sub) => {
      const answers = sub.answers as Array<{
        questionId: string;
        topicId: string;
        isCorrect: boolean;
      }>;

      if (Array.isArray(answers)) {
        answers.forEach((ans) => {
          if (!ans.topicId) return;
          if (!topicStats[ans.topicId]) {
            topicStats[ans.topicId] = { correct: 0, total: 0 };
          }
          topicStats[ans.topicId].total++;
          if (ans.isCorrect) {
            topicStats[ans.topicId].correct++;
          }
        });
      }
    });

    const weakTopicIds = Object.keys(topicStats).filter((topicId) => {
      const stats = topicStats[topicId];
      const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
      return accuracy < 0.5;
    });

    if (weakTopicIds.length === 0) {
      return [];
    }

    // 3. Fetch resources for weak topics
    const resources = await this.prisma.learningResource.findMany({
      where: {
        topicId: { in: weakTopicIds },
      },
      include: {
        topic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 4. Sign URLs
    return Promise.all(
      resources.map(async (resource) => {
        if (resource.type === 'PDF' || resource.type === 'AUDIO') {
          return {
            ...resource,
            url: await this.storageService.getPresignedUrl(resource.url),
          };
        }
        return resource;
      }),
    );
  }
}
