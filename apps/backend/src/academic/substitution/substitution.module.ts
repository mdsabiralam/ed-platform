import { Module } from '@nestjs/common';
import { SubstitutionController } from './substitution.controller';
import { SubstitutionService } from './substitution.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  controllers: [SubstitutionController],
  providers: [SubstitutionService, PrismaService, EventEmitter2],
})
export class SubstitutionModule {}
