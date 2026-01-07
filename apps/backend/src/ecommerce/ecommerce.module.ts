import { Module } from '@nestjs/common';
import { EcommerceProductService } from './ecommerce-product.service';
import { MarketplaceService } from './marketplace.service';
import { OrderService } from './order.service';
import { RevenueService } from './revenue.service';
import { EcommerceController } from './ecommerce.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EcommerceController],
  providers: [
    EcommerceProductService,
    MarketplaceService,
    OrderService,
    RevenueService,
  ],
})
export class EcommerceModule {}
