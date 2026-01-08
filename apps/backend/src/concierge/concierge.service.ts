import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConciergeRequestDto } from './dto/create-concierge-request.dto';
import { UpdateConciergeRequestDto } from './dto/update-concierge-request.dto';

@Injectable()
export class ConciergeService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateConciergeRequestDto) {
    return this.prisma.conciergeRequest.create({
      data: createDto,
    });
  }

  findAll() {
    return this.prisma.conciergeRequest.findMany();
  }

  findOne(id: string) {
    return this.prisma.conciergeRequest.findUnique({
      where: { id },
    });
  }

  update(id: string, updateDto: UpdateConciergeRequestDto) {
    return this.prisma.conciergeRequest.update({
      where: { id },
      data: updateDto,
    });
  }

  reject(id: string) {
    return this.prisma.conciergeRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }
}
