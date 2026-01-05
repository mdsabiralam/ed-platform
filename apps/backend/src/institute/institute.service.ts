import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstituteDto } from './dto/create-institute.dto';

@Injectable()
export class InstituteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstituteDto: CreateInstituteDto) {
    const { subdomain } = createInstituteDto;

    // Check if subdomain already exists
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existing) {
      throw new BadRequestException('Subdomain already taken');
    }

    return this.prisma.tenant.create({
      data: {
        name: createInstituteDto.name,
        subdomain: createInstituteDto.subdomain,
        // Default subscription status is ACTIVE as per schema default
        subscriptionStatus: 'ACTIVE',
      },
    });
  }
}
