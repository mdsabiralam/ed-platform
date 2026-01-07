import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceBookEventType } from '@prisma/client';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async createServiceBookEntry(data: {
    staffId: string;
    eventDate: Date;
    eventType: ServiceBookEventType;
    documentUrl?: string;
    authorizedBy: string;
  }) {
    // 4.G.03 Validate that the event_date is not in the future (unless it's a scheduled retirement)
    // Assuming "Termination" might be used for retirement or we should check logic.
    // The requirement says "unless it's a scheduled retirement". But "Retirement" is not in the Enum.
    // Maybe "Termination" implies it, or maybe I should check if eventType is related.
    // However, strictly "event_date is not in the future".
    // I will check if eventType is 'Termination' and maybe allow future dates for that?
    // Or maybe I should strictly follow "not in the future".
    // "unless it's a scheduled retirement" implies there IS a way to specify retirement.
    // But the Enum is: Appointment, Probation_Clearance, Confirmation, Promotion, Transfer, Suspension, Termination.
    // I will stick to: if date > now, throw error, unless it is a "Termination" (which could be retirement).

    const now = new Date();
    if (data.eventDate > now && data.eventType !== 'Termination') {
      throw new BadRequestException('Event date cannot be in the future.');
    }

    if (!data.authorizedBy) {
      throw new BadRequestException('Authorized by Admin ID is required.');
    }

    // Verify staff exists
    const staff = await this.prisma.staffProfile.findUnique({
      where: { id: data.staffId },
    });
    if (!staff) {
      throw new NotFoundException('Staff profile not found.');
    }

    return this.prisma.serviceBook.create({
      data: {
        staffId: data.staffId,
        eventDate: data.eventDate,
        eventType: data.eventType,
        documentUrl: data.documentUrl,
        authorizedBy: data.authorizedBy,
      },
    });
  }

  async getServiceBook(staffId: string) {
    // 4.G.04 Return the data sorted by event_date DESC to show the latest history first.
    return this.prisma.serviceBook.findMany({
      where: { staffId },
      orderBy: { eventDate: 'desc' },
    });
  }

  // 4.G.08 Logic to calculate pro-rata leaves
  async initializeLeaveBalance(staffId: string, joiningDate: Date) {
    const year = joiningDate.getFullYear();
    const month = joiningDate.getMonth(); // 0-11

    // Total months remaining in the year including joining month
    // Assuming financial year or calendar year? "year" in leave_balances suggests calendar year usually or academic.
    // Let's assume Calendar Year (Jan-Dec) for simplicity unless specified.
    // Remaining months = 12 - month.

    const remainingMonths = 12 - month;

    // Standard Quotas (Assumption, as they are not provided in requirements, usually 12 CL, 12 SL, etc.)
    // I will use some defaults or maybe 0 if not specified.
    // Requirement says "calculating pro-rata leaves based on the joining month".
    // Without standard quotas, I cannot calculate pro-rata.
    // I will assume standard annual quota is 12 for each for now, or make it 0.
    // Or better, I should fetch it from `LeaveType` if available, but the prompt says "cl_quota, sl_quota, pl_quota" columns in leave_balances.
    // This implies fixed types.
    // I'll assume 12 per year for calculation demonstration.

    const ANNUAL_CL = 12;
    const ANNUAL_SL = 12;
    const ANNUAL_PL = 12;

    const clQuota = (ANNUAL_CL / 12) * remainingMonths;
    const slQuota = (ANNUAL_SL / 12) * remainingMonths;
    const plQuota = (ANNUAL_PL / 12) * remainingMonths;

    return this.prisma.leaveBalance.create({
      data: {
        staffId,
        year,
        clQuota: parseFloat(clQuota.toFixed(2)),
        slQuota: parseFloat(slQuota.toFixed(2)),
        plQuota: parseFloat(plQuota.toFixed(2)),
      },
    });
  }
}
