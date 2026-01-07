import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoanApplicationDto, DisbursementWebhookDto } from './dto/loan-application.dto';

@Injectable()
export class FintechService {
  private readonly logger = new Logger(FintechService.name);

  constructor(private prisma: PrismaService) {}

  async checkEligibility(dto: LoanApplicationDto) {
    // 1. Create Application Record
    const application = await this.prisma.loanApplication.create({
      data: {
        studentId: dto.studentId,
        parentId: dto.parentId,
        amount: dto.amount,
        panNumber: dto.panNumber,
        incomeDetails: dto.incomeDetails,
        status: 'PENDING',
      },
    });

    // 2. Mock Call to NBFC Partner API
    // const score = await axios.post('https://nbfc.com/check', { pan: dto.panNumber });
    const mockScore = 750; // Approved

    if (mockScore > 700) {
      await this.prisma.loanApplication.update({
        where: { id: application.id },
        data: { status: 'APPROVED' },
      });
      return { eligible: true, applicationId: application.id };
    } else {
      await this.prisma.loanApplication.update({
        where: { id: application.id },
        data: { status: 'REJECTED' },
      });
      return { eligible: false, applicationId: application.id };
    }
  }

  async handleDisbursementWebhook(dto: DisbursementWebhookDto) {
    const { applicationId, status, transactionId } = dto;

    if (status !== 'SUCCESS') {
        this.logger.warn(`Disbursement failed for App ${applicationId}`);
        return;
    }

    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');

    // Update Application Status
    await this.prisma.loanApplication.update({
        where: { id: applicationId },
        data: { status: 'DISBURSED' },
    });

    // Mark Fee as PAID in FeeLedger
    // Logic: Find pending fees for this student up to the loan amount?
    // Or specific fee?
    // Prompt: "mark the student's School Fee as 'PAID' in the fee_ledger"
    // I will find the oldest PENDING fee or create a payment entry.
    // Let's assume we pay off all pending fees up to amount.

    const pendingFees = await this.prisma.feeLedger.findMany({
        where: {
            studentId: application.studentId,
            status: 'PENDING',
        },
        orderBy: { dueDate: 'asc' },
    });

    let remainingAmount = application.amount;

    for (const fee of pendingFees) {
        if (remainingAmount >= fee.amount) {
            await this.prisma.feeLedger.update({
                where: { id: fee.id },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    transactionId: transactionId,
                },
            });
            remainingAmount -= fee.amount;
        }
    }

    this.logger.log(`Fees paid for Student ${application.studentId} via Loan ${applicationId}`);
    return { success: true };
  }
}
