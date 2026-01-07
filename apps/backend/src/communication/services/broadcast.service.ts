import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AudienceService, BroadcastFilterDto } from './audience.service';
import { CreateCampaignDto, EstimateCostDto } from '../dto/broadcast.dto';
import { BroadcastStatus } from '@prisma/client';

@Injectable()
export class BroadcastService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audienceService: AudienceService,
    @InjectQueue('broadcast_queue') private broadcastQueue: Queue,
  ) {}

  async createCampaign(dto: CreateCampaignDto, senderId: string) {
    // 1. Save campaign
    const campaign = await this.prisma.broadcastCampaign.create({
      data: {
        title: dto.title,
        messageBody: dto.messageBody,
        channel: dto.channel,
        targetFilter: dto.targetFilter,
        senderId: senderId,
        status: BroadcastStatus.PROCESSING,
      },
    });

    // 2. Fetch Audience
    const users = await this.audienceService.fetchUsers(dto.targetFilter as BroadcastFilterDto);

    // 3. Queue jobs
    const jobs = users.map((user) => ({
      name: 'send-message',
      data: {
        campaignId: campaign.id,
        userId: user.id,
        message: dto.messageBody,
        channel: dto.channel,
      },
      opts: {
        removeOnComplete: true,
      }
    }));

    await this.broadcastQueue.addBulk(jobs);

    return { campaignId: campaign.id, status: 'PROCESSING', recipientCount: users.length };
  }

  async estimateCost(dto: EstimateCostDto) {
    const users = await this.audienceService.fetchUsers(dto.targetFilter as BroadcastFilterDto);
    const userCount = users.length;

    // Cost Logic (Simplified)
    // SMS: 160 chars = 1 part. Cost = parts * rate
    let cost = 0;
    const ratePerSms = 0.5; // Dummy rate

    if (dto.channel === 'SMS') {
      const parts = Math.ceil(dto.messageBody.length / 160);
      cost = userCount * parts * ratePerSms;
    } else {
        // Email/Push might be free or different rate
        cost = 0;
    }

    return {
      estimatedCost: cost,
      totalUsers: userCount,
      messageParts: dto.channel === 'SMS' ? Math.ceil(dto.messageBody.length / 160) : 1
    };
  }

  async getCampaignStats(campaignId: string) {
    const logs = await this.prisma.broadcastLog.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: true,
    });

    const totalSent = logs.reduce((acc, curr) => acc + curr._count, 0);
    // Calculate percentages logic...

    return {
        totalSent,
        breakdown: logs
    };
  }
}
