import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as xlsx from 'xlsx';
import { CreateCurriculumPlanDto } from './dto/create-curriculum-plan.dto';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

  /**
   * 7.A.04 Import Syllabus from Excel
   * Expected Excel Structure:
   * Sheet 1: Columns -> Chapter Number, Chapter Name, Topic Name, Estimated Hours
   */
  async importCurriculum(
    tenantId: string,
    file: Express.Multer.File,
    meta: CreateCurriculumPlanDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new BadRequestException('Excel sheet is empty');
    }

    // Create or find Curriculum Plan
    const plan = await this.prisma.curriculumPlan.upsert({
      where: {
        tenantId_classId_subjectId_academicYearId_version: {
          tenantId,
          classId: meta.classId,
          subjectId: meta.subjectId,
          academicYearId: meta.academicYearId,
          version: meta.version || '1.0',
        },
      },
      update: {},
      create: {
        tenantId,
        classId: meta.classId,
        subjectId: meta.subjectId,
        academicYearId: meta.academicYearId,
        version: meta.version || '1.0',
      },
    });

    // Group data by Chapter
    const chaptersMap = new Map<number, { name: string; topics: any[] }>();

    for (const row of data) {
      const chapterNum = row['Chapter Number'] || row['chapter_number'];
      const chapterName = row['Chapter Name'] || row['chapter_name'];
      const topicName = row['Topic Name'] || row['topic_name'];
      const hours = row['Estimated Hours'] || row['estimated_hours'];

      if (!chapterNum || !chapterName || !topicName) {
        continue; // Skip invalid rows
      }

      if (!chaptersMap.has(chapterNum)) {
        chaptersMap.set(chapterNum, { name: chapterName, topics: [] });
      }
      const chapter = chaptersMap.get(chapterNum);
      if (chapter) {
        chapter.topics.push({ name: topicName, hours: parseFloat(hours) || 1.0 });
      }
    }

    // Save Chapters and Topics transactionally
    await this.prisma.$transaction(async (tx) => {
      // 7.A.04 Idempotency: Delete existing Chapters (cascade deletes Topics) for this plan
      await tx.chapter.deleteMany({
        where: { planId: plan.id },
      });

      for (const [chapterNum, chapterData] of chaptersMap.entries()) {
        // Create Chapter
        const chapter = await tx.chapter.create({
          data: {
            planId: plan.id,
            chapterNumber: chapterNum,
            name: chapterData.name,
            // 7.A.06 Target completion date logic can be added here if provided in Excel
          },
        });

        // Create Topics
        let orderIndex = 0;
        for (const topicData of chapterData.topics) {
          await tx.topic.create({
            data: {
              chapterId: chapter.id,
              name: topicData.name,
              estimatedHours: topicData.hours,
              orderIndex: orderIndex++,
            },
          });
        }
      }
    });

    return { message: 'Curriculum imported successfully', planId: plan.id };
  }

  /**
   * 7.B.01 & 7.B.02 Mark Topic as Completed (Syllabus Tracking)
   */
  async markTopicCompleted(
    tenantId: string,
    topicId: string,
    userId: string,
    sectionId: string,
    completionDate: Date = new Date(),
  ) {
    // Verify topic exists
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Topic not found');

    // Lookup Teacher Profile
    const teacherProfile = await this.prisma.staffProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
        throw new NotFoundException('Teacher profile not found for the user');
    }

    // Create Syllabus Log
    return this.prisma.syllabusLog.create({
      data: {
        tenantId,
        topicId,
        teacherId: teacherProfile.id,
        sectionId,
        completionDate,
      },
    });
  }

  /**
   * 7.B.04 Get Syllabus Status
   */
  async getSyllabusStatus(tenantId: string, classId: string, subjectId: string, sectionId: string) {
    // Fetch Plan
    const plan = await this.prisma.curriculumPlan.findFirst({
      where: { tenantId, classId, subjectId },
      orderBy: { version: 'desc' }, // Get latest version
      include: {
        chapters: {
          include: {
            topics: {
              include: {
                syllabusLogs: {
                  where: { sectionId }, // Filter logs by section
                },
              },
            },
          },
        },
      },
    });

    if (!plan) throw new NotFoundException('Curriculum Plan not found');

    let totalTopics = 0;
    let completedTopics = 0;
    let totalEstimatedHours = 0;
    let completedEstimatedHours = 0;

    const chaptersStatus = plan.chapters.map((chapter) => {
      const chapterTotalTopics = chapter.topics.length;
      const chapterCompletedTopics = chapter.topics.filter((t) => t.syllabusLogs.length > 0).length;

      totalTopics += chapterTotalTopics;
      completedTopics += chapterCompletedTopics;

      return {
        chapterName: chapter.name,
        chapterNumber: chapter.chapterNumber,
        totalTopics: chapterTotalTopics,
        completedTopics: chapterCompletedTopics,
        isCompleted: chapterTotalTopics > 0 && chapterTotalTopics === chapterCompletedTopics,
        topics: chapter.topics.map(t => ({
          name: t.name,
          isCompleted: t.syllabusLogs.length > 0,
          completedAt: t.syllabusLogs[0]?.completionDate || null
        }))
      };
    });

    const completionPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    return {
      subjectId,
      completionPercentage: parseFloat(completionPercentage.toFixed(2)),
      chapters: chaptersStatus,
    };
  }
}
