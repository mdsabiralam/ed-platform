import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan } from '@prisma/client';

@Injectable()
export class SaasService {
  constructor(private prisma: PrismaService) {}

  async getPlans(): Promise<Plan[]> {
    return this.prisma.plan.findMany();
  }
}
