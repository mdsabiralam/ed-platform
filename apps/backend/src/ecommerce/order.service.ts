import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RevenueService } from './revenue.service';
import { WebhookLogisticsDto } from './dto/webhook-logistics.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private revenueService: RevenueService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const { items, userId } = dto;

    // 1. Calculate Total & Validate Stock (Optimistic Locking)
    let totalAmount = 0;

    // Use transaction to ensure atomicity
    const order = await this.prisma.$transaction(async (tx) => {
      // Create Order Header first (status CREATED)
      const newOrder = await tx.ecommerceOrder.create({
        data: {
          userId: userId!, // Assumed verified
          status: 'CREATED',
          totalAmount: 0, // Update later
        },
      });

      for (const item of items) {
        // Fetch Product/Variant
        const variant = await tx.ecommerceVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);

        if (variant.stockQty < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${variant.product.name}`);
        }

        const price = variant.product.basePrice; // Simplified. Variant might have price override.
        totalAmount += price * item.quantity;

        // Create Order Item
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: variant.productId,
            variantId: variant.id,
            quantity: item.quantity,
            price: price,
          },
        });

        // Decrement Stock with Optimistic Locking
        // We read `variant.version`. We expect it to be same.
        const updateCount = await tx.ecommerceVariant.updateMany({
          where: {
            id: variant.id,
            version: variant.version,
          },
          data: {
            stockQty: { decrement: item.quantity },
            version: { increment: 1 },
          },
        });

        if (updateCount.count === 0) {
          throw new ConflictException(`Stock changed for ${variant.product.name}. Please retry.`);
        }
      }

      // Update Total
      return tx.ecommerceOrder.update({
        where: { id: newOrder.id },
        data: { totalAmount },
      });
    });

    return order;
  }

  async processPayment(orderId: string) {
    const order = await this.prisma.ecommerceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== 'CREATED') return order; // Idempotency

    // 1. Mark Paid
    const updatedOrder = await this.prisma.ecommerceOrder.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    // 2. Trigger Revenue Split
    await this.revenueService.calculateAndLogCommission(order.id, order.totalAmount);

    // 3. Move to Processing (Auto)
    await this.updateStatus(orderId, 'PROCESSING');

    return updatedOrder;
  }

  async updateStatus(orderId: string, status: string) {
    return this.prisma.ecommerceOrder.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async handleLogisticsWebhook(dto: WebhookLogisticsDto) {
    const { orderId, status, trackingNo } = dto;

    const order = await this.prisma.ecommerceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.ecommerceOrder.update({
      where: { id: orderId },
      data: {
        status: status, // Map generic status to Enum if needed. Assuming string matches.
        trackingNo: trackingNo,
        courierPartner: dto.courierPartner,
      },
    });

    if (status === 'SHIPPED') {
      this.sendWhatsAppNotification(order.userId, trackingNo!);
    }

    return updated;
  }

  private async sendWhatsAppNotification(userId: string, trackingNo: string) {
    // Mock Notification
    console.log(`[WhatsApp] Sending tracking info ${trackingNo} to User ${userId}`);
    // implementation of actual provider would go here
  }
}
