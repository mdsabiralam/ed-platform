import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddStockDto } from './dto/add-stock.dto';
import { CreateIndentDto } from './dto/create-indent.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addStock(dto: AddStockDto, tenantId: string) {
    // 2. Update quantity using Weighted Average Cost calculation
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: dto.itemId },
    });

    if (!item) throw new NotFoundException('Item not found');

    const oldStock = item.currentStock;
    const oldPrice = item.unitPrice;
    const newStock = dto.quantity;
    const newPrice = dto.unitCost;

    const totalQuantity = oldStock + newStock;
    // WAC = ((Old Qty * Old Price) + (New Qty * New Price)) / Total Qty
    const wac = ((oldStock * oldPrice) + (newStock * newPrice)) / totalQuantity;

    return this.prisma.inventoryItem.update({
      where: { id: dto.itemId },
      data: {
        currentStock: totalQuantity,
        unitPrice: wac,
      },
    });
  }

  async createIndent(dto: CreateIndentDto, tenantId: string, userId: string) {
    // Resolve staff profile
    const staff = await this.prisma.staffProfile.findUnique({ where: { userId } });
    if (!staff) throw new NotFoundException('Staff profile not found for user');

    return this.prisma.indent.create({
      data: {
        tenantId,
        requesterId: staff.id,
        status: 'PENDING',
        items: dto.items, // JSON
      },
    });
  }

  async approveIndent(indentId: string, approverUserId: string) {
    const approver = await this.prisma.staffProfile.findUnique({ where: { userId: approverUserId } });
    // if (!approver) ...

    const indent = await this.prisma.indent.update({
      where: { id: indentId },
      data: {
        status: 'APPROVED',
        approvedBy: approver?.id,
        approvalDate: new Date(),
      },
    });

    // 3. On approval, automatically generate a PDF 'Purchase Order'
    const pdfBytes = await this.generatePurchaseOrder(indent);

    // In a real app, upload PDF to storage and return URL.
    // Here we return success or the bytes (simulated).
    return { success: true, message: 'Indent approved and PO generated', poUrl: 'mock-url/po.pdf' };
  }

  private async generatePurchaseOrder(indent: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`Purchase Order - Indent #${indent.id}`, {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    // Add items...

    return await pdfDoc.save();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkLowStock() {
    this.logger.log('Checking low stock...');
    // Use raw query for column comparison
    const lowStockItems = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM inventory_items
      WHERE current_stock < reorder_level
    `;

    if (lowStockItems.length > 0) {
      this.logger.warn(`Found ${lowStockItems.length} items below reorder level. Emailing admin...`);
      // Email logic would go here
    }
  }
}
