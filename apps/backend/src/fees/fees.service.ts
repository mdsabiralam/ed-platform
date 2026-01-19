import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeesService {
  constructor(private prisma: PrismaService) {}

  async getStudentFees(studentId: string) {
    return this.prisma.studentFee.findMany({
      where: { studentId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async payFee(feeId: string, paymentMethod: string) {
    const fee = await this.prisma.studentFee.findUnique({
      where: { id: feeId },
    });

    if (!fee) {
      throw new NotFoundException('Fee not found');
    }

    const updatedFee = await this.prisma.studentFee.update({
      where: { id: feeId },
      data: {
        status: 'PAID',
        paymentDate: new Date(),
        invoiceUrl: `https://mock-s3.com/invoices/${feeId}.pdf`,
      },
    });

    return updatedFee;
  }
}
