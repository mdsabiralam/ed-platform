import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async getServiceBook(staffId: string) {
    const book = await this.prisma.serviceBook.findUnique({
      where: { staffId },
    });
    if (!book) throw new NotFoundException('Service book not found');
    return book;
  }
}
