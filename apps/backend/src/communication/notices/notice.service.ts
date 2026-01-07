import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NoticeService {
  constructor(private prisma: PrismaService) {}

  async create(createNoticeDto: CreateNoticeDto, authorId: string, tenantId: string, userRole: string, userClassId?: string) {
    const expiry = new Date(createNoticeDto.expiryDate);
    if (expiry <= new Date()) {
      throw new BadRequestException('Expiry date must be in the future');
    }

    const audience = createNoticeDto.targetAudience as any;

    if (userRole === 'TEACHER') {
      if (audience.role === 'ALL') {
        throw new ForbiddenException('Teachers cannot post global notices.');
      }

      if (!audience.classId) {
         throw new ForbiddenException('Teachers must specify a target class.');
      }

      // Strict RBAC: Fail-closed if teacher's class cannot be verified
      if (!userClassId) {
         throw new ForbiddenException('Teacher class assignment not verified. Cannot authorize post.');
      }

      if (audience.classId !== userClassId) {
        throw new ForbiddenException('Teachers can only post notices for their assigned class.');
      }
    }

    return this.prisma.notice.create({
      data: {
        title: createNoticeDto.title,
        content: createNoticeDto.content,
        attachmentUrl: createNoticeDto.attachmentUrl,
        isPinned: createNoticeDto.isPinned || false,
        expiryDate: expiry,
        targetAudience: createNoticeDto.targetAudience as Prisma.InputJsonValue,
        authorId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, userRole: string, userClassId?: string) {
    const now = new Date();

    const notices = await this.prisma.notice.findMany({
      where: {
        tenantId,
        expiryDate: { gt: now },
        deletedAt: null,
      },
      orderBy: [
        { isPinned: 'desc' },
        { publishedAt: 'desc' },
      ],
      include: {
        author: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    return notices.filter(notice => {
      const audience = notice.targetAudience as any;
      if (audience.role === 'ALL') return true;
      if (userClassId && audience.classId === userClassId) return true;
      return false;
    });
  }

  async getArchived(tenantId: string) {
    return this.prisma.notice.findMany({
      where: {
        tenantId,
        OR: [
          { expiryDate: { lte: new Date() } },
          { deletedAt: { not: null } }
        ],
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async update(id: string, updateNoticeDto: Partial<CreateNoticeDto>, userId: string, userRole: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && notice.authorId !== userId) {
       throw new ForbiddenException('You can only edit your own notices.');
    }

    const data: any = { ...updateNoticeDto };
    if (updateNoticeDto.expiryDate) {
      data.expiryDate = new Date(updateNoticeDto.expiryDate);
    }

    return this.prisma.notice.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && notice.authorId !== userId) {
       throw new ForbiddenException('You can only delete your own notices.');
    }

    return this.prisma.notice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async markRead(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastCheckedNoticesAt: new Date() },
    });
  }

  async getUnreadCount(userId: string, tenantId: string, userClassId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const lastChecked = user.lastCheckedNoticesAt || new Date(0);
    const now = new Date();

    const notices = await this.prisma.notice.findMany({
      where: {
        tenantId,
        expiryDate: { gt: now },
        publishedAt: { gt: lastChecked },
        deletedAt: null,
      }
    });

    const unread = notices.filter(notice => {
       const audience = notice.targetAudience as any;
       if (audience.role === 'ALL') return true;
       if (userClassId && audience.classId === userClassId) return true;
       return false;
    });

    return { count: unread.length };
  }
}
