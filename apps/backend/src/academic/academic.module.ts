import { Module } from '@nestjs/common';
import { AcademicController } from './academic.controller';
import { VideoConferenceService } from './services/video-conference.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AcademicController],
  providers: [VideoConferenceService, PrismaService],
})
export class AcademicModule {}
