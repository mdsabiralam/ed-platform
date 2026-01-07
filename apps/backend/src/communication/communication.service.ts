import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AudienceService } from './services/audience.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectQueue('broadcast_queue') private broadcastQueue: Queue,
    private prisma: PrismaService,
    private audienceService: AudienceService,
  ) {}

  async createCampaign(dto: CreateCampaignDto, senderId: string) {
    // 1. Save campaign
    const campaign = await this.prisma.broadcastCampaign.create({
      data: {
        title: dto.title,
        messageBody: dto.messageBody,
        channel: dto.channel,
        targetFilter: dto.filter as any,
        status: 'PROCESSING',
        senderId,
      },
    });

    // 2. Fetch users
    const users = await this.audienceService.fetchUsers(dto.filter);

    // 3. Queue jobs
    const jobs = users.map(user => ({
      name: 'send-message',
      data: {
        campaignId: campaign.id,
        userId: user.id,
        message: dto.messageBody,
        channel: dto.channel,
      },
    }));

    if (jobs.length > 0) {
        await this.broadcastQueue.addBulk(jobs);
    } else {
        // If no users, maybe mark as COMPLETED immediately?
        await this.prisma.broadcastCampaign.update({
            where: { id: campaign.id },
            data: { status: 'COMPLETED' }
        });
    }

    return { campaignId: campaign.id, userCount: users.length };
  }

  async estimateCost(dto: CreateCampaignDto) {
    const users = await this.audienceService.fetchUsers(dto.filter);
    const count = users.length;
    // SMS logic: 160 chars = 1 credit.
    // For other channels, cost might be 0 or different.
    const parts = Math.ceil(dto.messageBody.length / 160);
    const ratePerSms = 0.5; // Example
    const totalCost = dto.channel === 'SMS' ? (count * parts * ratePerSms) : 0;

    return {
      userCount: count,
      estimatedCost: totalCost,
      currency: 'BDT'
    };
  }
}
