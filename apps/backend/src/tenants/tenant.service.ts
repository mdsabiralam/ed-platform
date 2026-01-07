import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existing) {
      throw new ConflictException('Subdomain already taken');
    }

    const { resellerCode, ...data } = createTenantDto;

    const tenant = await this.prisma.tenant.create({
      data: {
        ...data,
        subscriptionStatus: 'ACTIVE',
      },
    });

    if (resellerCode) {
      // 10.G.2 Implement Cookie Logic: If a school signs up... attribute the sale to that reseller.
      // We assume resellerCode is passed from the cookie by the controller/frontend.
      // We look for a reseller profile that might own this code or just link it.
      // The schema for ReferralLinkage needs 'resellerId'.
      // We assume 'resellerCode' maps to 'resellerId' or 'referralCode' in ReferralLinkage.
      // But ReferralLinkage is the record OF the link.
      // We need to find the reseller.
      // Assuming `resellerCode` passed here IS the `resellerId` (or User ID of reseller).
      // Let's verify if a ResellerProfile exists with this ID.
      // If `resellerCode` is actually a referral code (e.g. "SUMMER25"), we need to lookup who owns it.
      // But ResellerProfile doesn't have `referralCode`.
      // The previous prompt assumed Reseller has a unique code.
      // Let's assume the `resellerCode` IS the `resellerId` (UUID).

      const reseller = await this.prisma.resellerProfile.findFirst({
         where: {
            OR: [
              { id: resellerCode },
              { userId: resellerCode }
            ]
         }
      });

      if (reseller) {
        await this.prisma.referralLinkage.create({
          data: {
            resellerId: reseller.id,
            tenantId: tenant.id,
            referralCode: resellerCode, // Store the code used
          }
        });
      }
    }

    return tenant;
  }

  async findAll() {
    return this.prisma.tenant.findMany();
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }
}