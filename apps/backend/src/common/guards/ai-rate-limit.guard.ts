import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { studentId } = request.body;

    if (!studentId) {
      throw new HttpException('Student ID is required', HttpStatus.BAD_REQUEST);
    }

    // 1. Fetch Student and their Tenant's Subscription Plan
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }, // Assuming studentId is the primary key UUID, not admissionNo
      include: {
        tenant: {
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.tenant || !student.tenant.subscription) {
      // If no subscription info found, default to strict limits or deny
      // For this task, let's assume 'Silver' behavior (restricted) if unknown
      return this.checkSilverLimit(studentId);
    }

    const planName = student.tenant.subscription.plan.name.toUpperCase();

    // 2. Check Tier
    if (planName === 'GOLD') {
      return true; // Unlimited
    } else {
      // Silver or others
      return this.checkSilverLimit(studentId);
    }
  }

  private async checkSilverLimit(studentId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.aiRequestLog.count({
      where: {
        studentId: studentId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (count >= 10) {
      throw new HttpException('Daily AI limit reached (10 requests/day). Upgrade to Gold for unlimited access.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Log this request (This should strictly happen AFTER logic, but Guards are before handler.
    // Ideally, we log in an interceptor or the controller.
    // However, for rate limiting "check", we just read.
    // To strictly implement "10 requests per day", we must count successful requests.
    // The prompt implies we check AND limit.
    // I will log it here for simplicity of the task, or rely on the Controller to log.
    // Given the prompt "check ... logs", I assume logs exist.
    // I'll insert a log here effectively "consuming" a token.)
    await this.prisma.aiRequestLog.create({
      data: {
        studentId,
        endpoint: '/api/ai/doubt',
      },
    });

    return true;
  }
}
