import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // 1. ইভেন্ট তৈরি করা
  async createEvent(data: { tenantId: string; name: string; startTime: Date; endTime: Date; location?: string }) {
    return this.prisma.event.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
      },
    });
  }

  // 2. সব ইভেন্ট দেখা (Admin Dashboard এর জন্য নতুন যুক্ত করা হলো)
  async findAllEvents(tenantId: string) {
    return this.prisma.event.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        _count: {
          select: { duties: true }, // মোট কতজন ডিউটি করছে তার সংখ্যাও দেখাবে
        },
      },
    });
  }

  // 3. ডিউটি অ্যাসাইন করা (Conflict Detection সহ)
  async assignDuty(data: { eventId: string; staffProfileId: string; role: string; startTime: Date; endTime: Date }) {
    const event = await this.prisma.event.findUnique({ where: { id: data.eventId } });
    if (!event) throw new BadRequestException('Event not found');

    // কনফ্লিক্ট চেক
    const conflictingDuty = await this.prisma.eventDuty.findFirst({
      where: {
        assignedToId: data.staffProfileId,
        status: 'ASSIGNED',
        OR: [
          { startTime: { lte: data.startTime }, endTime: { gt: data.startTime } },
          { startTime: { lt: data.endTime }, endTime: { gte: data.endTime } },
          { startTime: { gte: data.startTime }, endTime: { lte: data.endTime } }
        ],
      },
    });

    if (conflictingDuty) {
      throw new ConflictException(`Staff member is already assigned to another duty (Duty ID: ${conflictingDuty.id})`);
    }

    return this.prisma.eventDuty.create({
      data: {
        eventId: data.eventId,
        assignedToId: data.staffProfileId,
        roleDescription: data.role,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'ASSIGNED',
      },
    });
  }

  // 4. নিজের ডিউটি দেখা (Mobile App)
  async getMyDuties(profileId: string) {
    return this.prisma.eventDuty.findMany({
      where: {
        assignedToId: profileId,
        status: 'ASSIGNED',
        startTime: { gte: new Date() },
      },
      include: { event: true },
      orderBy: { startTime: 'asc' },
    });
  }
}