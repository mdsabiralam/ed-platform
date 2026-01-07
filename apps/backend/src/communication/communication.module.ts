import { Module } from '@nestjs/common';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { BroadcastService } from './broadcast.service';
import { DataRetentionService } from './data-retention.service';
import { PrismaService } from '../prisma/prisma.service'; // Assuming PrismaService location
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CommunicationController],
  providers: [CommunicationService, BroadcastService, DataRetentionService, ConfigService],
})
export class CommunicationModule {}
