import { Controller, Get, Post, Body, Query, Param, Headers } from '@nestjs/common';
import { EcommerceProductService } from './ecommerce-product.service';
import { MarketplaceService } from './marketplace.service';
import { OrderService } from './order.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { WebhookLogisticsDto } from './dto/webhook-logistics.dto';

@Controller('api/ecommerce')
export class EcommerceController {
  constructor(
    private productService: EcommerceProductService,
    private marketplaceService: MarketplaceService,
    private orderService: OrderService,
  ) {}

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Get('products')
  getProducts(@Query() filters: FilterProductDto) {
    return this.productService.findAll(filters);
  }

  @Get('recommendations')
  getRecommendations(@Headers('x-user-id') userId: string) {
    // In real app, userId comes from AuthGuard / Request User
    // Here we might need to resolve Student ID from User ID if not direct.
    // Assuming x-user-id is passed for simulation or resolved by Guard.
    // For "Parent logs in", we check their Child.
    // Let's assume input is Student ID for simplicity of this task's scope,
    // or we fetch Student by User (Parent).
    // The requirement: "When a parent logs in... check their child's profile".
    // I will assume the header provides the CHILD's student ID context (common in parent apps)
    // or I fetch the child. Let's use `marketplaceService` logic which expects studentId.
    return this.marketplaceService.getRecommendations(userId);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Post('orders/:id/pay')
  payOrder(@Param('id') id: string) {
    return this.orderService.processPayment(id);
  }

  @Post('webhook/logistics')
  handleWebhook(@Body() dto: WebhookLogisticsDto) {
    return this.orderService.handleLogisticsWebhook(dto);
  }
}
