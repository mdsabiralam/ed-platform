import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(private prisma: PrismaService) {}

  // 10.I Financial Reconciliation Worker
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyReconciliation() {
    this.logger.log('Starting daily financial reconciliation...');

    // 1. Fetch daily transaction report from Payment Gateway API (Mocked)
    const gatewayReport = await this.mockFetchGatewayReport();

    // 2. Match each entry with internal settlement_transactions table
    for (const gatewayTx of gatewayReport) {
      const internalTx = await this.prisma.settlementTransaction.findUnique({
        where: { orderId: gatewayTx.orderId },
      });

      if (!internalTx) {
        // Flag discrepancy: Money received but Order ID missing
        this.logger.error(`DISCREPANCY: Order ${gatewayTx.orderId} found in Gateway but missing in DB.`);
        // Ideally save to a DiscrepancyLog table or alert Finance Team
        continue;
      }

      if (internalTx.amount !== gatewayTx.amount) {
        this.logger.error(`DISCREPANCY: Amount mismatch for Order ${gatewayTx.orderId}. Gateway: ${gatewayTx.amount}, DB: ${internalTx.amount}`);
        await this.prisma.settlementTransaction.update({
          where: { id: internalTx.id },
          data: {
            status: 'FAILED',
            discrepancy: `Amount mismatch. Gateway: ${gatewayTx.amount}`,
            reconciled: false,
          },
        });
      } else {
        // Success
        await this.prisma.settlementTransaction.update({
          where: { id: internalTx.id },
          data: {
            status: 'SETTLED',
            reconciled: true,
            discrepancy: null,
          },
        });
        this.logger.log(`Reconciled Order ${gatewayTx.orderId}`);
      }
    }

    this.logger.log('Reconciliation completed.');
  }

  private async mockFetchGatewayReport() {
    // Simulate API call to Stripe/Razorpay
    return [
      { orderId: 'ORD-123', amount: 100.0, status: 'PAID' },
      { orderId: 'ORD-124', amount: 250.50, status: 'PAID' },
      { orderId: 'ORD-MISSING', amount: 50.0, status: 'PAID' }, // Should trigger missing error
    ];
  }
}
