import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Assuming global PrismaModule or similar

@Module({
  imports: [PrismaModule],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
