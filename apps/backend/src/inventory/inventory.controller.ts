import { Controller, Post, Put, Body, Req, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AddStockDto } from './dto/add-stock.dto';
import { CreateIndentDto } from './dto/create-indent.dto';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('add-stock')
  async addStock(@Body() dto: AddStockDto, @Req() req: any) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.inventoryService.addStock(dto, tenantId);
  }

  @Post('indent')
  async createIndent(@Body() dto: CreateIndentDto, @Req() req: any) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    const userId = req.user?.sub || req.headers['x-user-id']; // requesterId
    // Need to resolve StaffProfile ID from userId. For now assuming passed or resolved in service.
    // Ideally we pass userId and service resolves it.
    return this.inventoryService.createIndent(dto, tenantId, userId);
  }

  @Put('indent/approve')
  async approveIndent(@Body() body: { indentId: string }, @Req() req: any) {
     const approverId = req.user?.sub || req.headers['x-user-id'];
     return this.inventoryService.approveIndent(body.indentId, approverId);
  }
}
