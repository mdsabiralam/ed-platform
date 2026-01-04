import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateInstituteDto } from './create-institute.dto';
import { UpdateInstituteDto } from './update-institute.dto';

@Injectable()
export class InstituteService {
  constructor(private prisma: PrismaService) {}

  async create(createInstituteDto: CreateInstituteDto) {
    const existing = await this.prisma.institute.findUnique({
      where: { subdomain: createInstituteDto.subdomain },
    });

    if (existing) {
      throw new ConflictException('Subdomain already taken');
    }

    return this.prisma.institute.create({
      data: {
        ...createInstituteDto,
        subscriptionStatus: 'ACTIVE',
      },
    });
  }

  async findAll() {
    return this.prisma.institute.findMany();
  }

  async findOne(id: string) {
    return this.prisma.institute.findUnique({ where: { id } });
  }

  async update(id: string, updateInstituteDto: UpdateInstituteDto) {
    return this.prisma.institute.update({
      where: { id },
      data: updateInstituteDto,
    });
  }

  async remove(id: string) {
    return this.prisma.institute.delete({ where: { id } });
  }
}