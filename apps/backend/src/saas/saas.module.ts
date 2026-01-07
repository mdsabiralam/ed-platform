import { Module } from '@nestjs/common';
import { SaasService } from './saas.service';
import { SaasController } from './saas.controller';
import { PrismaService } from '../prisma/prisma.service';

import { SuperAdminController } from './super-admin.controller';

@Module({
  controllers: [SaasController, SuperAdminController],
  providers: [SaasService, PrismaService],
})
export class SaasModule {}
