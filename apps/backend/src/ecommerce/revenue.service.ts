import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(private prisma: PrismaService) {}

  async calculateAndLogCommission(orderId: string, totalAmount: number, vendorId?: string) {
    // 1. Fetch Vendor Agreement
    // If multiple vendors in one order, this logic needs to be per-item or split.
    // For simplicity, assuming single vendor per order or main vendor.
    // Ideally, we iterate over items, group by vendor, and calc splits.

    // Simplification: Let's assume the order is linked to products, pick the first product's vendor.
    // A robust system would split by Line Item.

    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
      include: { product: true },
    });

    if (orderItems.length === 0) return;

    // Group by vendor
    const vendorTotals = new Map<string, number>();
    for (const item of orderItems) {
      const vid = item.product.vendorId;
      const amount = item.price * item.quantity;
      vendorTotals.set(vid, (vendorTotals.get(vid) || 0) + amount);
    }

    let totalVendorShare = 0;
    let totalSchoolShare = 0;
    let totalPlatformShare = 0;

    for (const [vId, vAmount] of vendorTotals.entries()) {
        const agreement = await this.prisma.vendorAgreement.findFirst({
            where: { vendorId: vId },
        });

        // Default split: 80/10/10 if no agreement
        const vPct = agreement ? agreement.vendorSharePercent : 80;
        const sPct = agreement ? agreement.schoolSharePercent : 10;
        const pPct = agreement ? agreement.platformSharePercent : 10;

        const vShare = (vAmount * vPct) / 100;
        const sShare = (vAmount * sPct) / 100;
        const pShare = (vAmount * pPct) / 100;

        totalVendorShare += vShare;
        totalSchoolShare += sShare;
        totalPlatformShare += pShare;
    }

    // Validation: Sum must equal Total (or close enough due to float)
    const calculatedTotal = totalVendorShare + totalSchoolShare + totalPlatformShare;
    if (Math.abs(calculatedTotal - totalAmount) > 1.0) {
        this.logger.warn(`Commission calculation mismatch: Order ${totalAmount} vs Calc ${calculatedTotal}`);
    }

    // Record in Ledger
    // Note: Schema has single vendorAmount column. If multi-vendor, we might sum them or need multi-row.
    // Sticking to schema: One ledger entry per order. Summing up.
    await this.prisma.commissionLedger.create({
      data: {
        orderId,
        vendorAmount: totalVendorShare,
        schoolAmount: totalSchoolShare,
        platformAmount: totalPlatformShare,
        totalAmount: totalAmount, // or calculatedTotal
      },
    });

    this.logger.log(`Commission logged for Order ${orderId}`);
  }
}
