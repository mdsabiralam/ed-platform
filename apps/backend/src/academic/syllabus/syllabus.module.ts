import { Module } from '@nestjs/common';
import { SyllabusController } from './syllabus.controller';
import { SyllabusService } from './syllabus.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SyllabusController],
  providers: [SyllabusService, PrismaService],
})
export class SyllabusModule {}
