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
    // Check if student already has 2 unreturned books
    const issuedBooksCount = await this.prisma.libraryTransaction.count({
      where: {
        tenantId,
        studentId,
        status: 'ISSUED',
      },
    });

    if (issuedBooksCount >= 2) {
      throw new BadRequestException('Student already has 2 unreturned books. Cannot issue more.');
    }

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
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 14); // 2 weeks issue period

      return tx.libraryTransaction.create({
        data: {
          tenantId,
          bookId: book.id,
          studentId,
          status: 'ISSUED',
          returnDate,
        },
      });
    });
  }

  async returnBook(tenantId: string, transactionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.libraryTransaction.findUnique({
        where: { id: transactionId },
        include: { book: true },
      });

      if (!transaction) throw new NotFoundException('Transaction not found');
      if (transaction.status === 'RETURNED') throw new BadRequestException('Book already returned');
      if (transaction.tenantId !== tenantId) throw new BadRequestException('Invalid tenant');

      const actualReturnDate = new Date();
      let fineAmount = 0;

      // Calculate Fine (e.g., 10 units per day late)
      if (transaction.returnDate && actualReturnDate > transaction.returnDate) {
        const diffTime = Math.abs(actualReturnDate.getTime() - transaction.returnDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        fineAmount = diffDays * 10;
      }

      // Increment inventory
      await tx.book.update({
        where: { id: transaction.bookId },
        data: { availableCopies: transaction.book.availableCopies + 1 },
      });

      // Update transaction
      return tx.libraryTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'RETURNED',
          actualReturnDate,
          fineAmount,
        },
      });
    });
  }
}
