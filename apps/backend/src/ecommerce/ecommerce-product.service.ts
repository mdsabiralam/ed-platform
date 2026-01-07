import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, CreateVariantDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class EcommerceProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    return this.prisma.ecommerceProduct.create({
      data: dto,
    });
  }

  async createVariant(dto: CreateVariantDto) {
    return this.prisma.ecommerceVariant.create({
      data: dto,
    });
  }

  async findAll(filters: FilterProductDto) {
    const where: any = {};
    if (filters.gradeLevel) where.gradeLevel = filters.gradeLevel;
    if (filters.board) where.board = filters.board;
    if (filters.category) where.category = filters.category;
    if (filters.subject) where.subject = filters.subject;

    return this.prisma.ecommerceProduct.findMany({
      where,
      include: {
        variants: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.ecommerceProduct.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
