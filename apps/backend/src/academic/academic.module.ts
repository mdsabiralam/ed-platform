import { Module } from '@nestjs/common';
import { AcademicController } from './academic.controller';
import { VideoConferenceService } from './services/video-conference.service';
import { AcademicService } from './academic.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AcademicController],
  providers: [VideoConferenceService, AcademicService, PrismaService],
})
export class AcademicModule {}
