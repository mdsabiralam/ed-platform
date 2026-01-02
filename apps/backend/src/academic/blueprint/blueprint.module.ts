import { Module } from '@nestjs/common';
import { BlueprintController } from './blueprint.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [BlueprintController],
  providers: [PrismaService],
})
export class BlueprintModule {}
