import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async getBookByBarcode(tenantId: string, barcode: string) {
    const book = await this.prisma.book.findUnique({
      where: {
        tenantId_barcode: {
          tenantId,
          barcode,
        },
      },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async issueBook(tenantId: string, barcode: string, studentId: string) {
    // Transaction to ensure atomic update of inventory and issue record
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({
        where: { tenantId_barcode: { tenantId, barcode } },
      });

      if (!book) throw new NotFoundException('Book not found');
      if (book.availableCopies <= 0) throw new BadRequestException('No copies available');

      // Decrement inventory
      await tx.book.update({
        where: { id: book.id },
        data: { availableCopies: book.availableCopies - 1 },
      });

      // Create transaction record
      return tx.libraryTransaction.create({
        data: {
          tenantId,
          bookId: book.id,
          studentId,
          status: 'ISSUED',
        },
      });
    });
  }
}
