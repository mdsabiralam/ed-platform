import { Module } from '@nestjs/common';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [HomeworkController],
  providers: [HomeworkService, PrismaService],
})
export class HomeworkModule {}
