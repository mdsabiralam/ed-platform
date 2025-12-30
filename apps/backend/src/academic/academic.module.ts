import { Module } from '@nestjs/common';
import { AcademicController } from './academic.controller';
import { VideoConferenceService } from './services/video-conference.service';
import { AcademicService } from './academic.service';
import { PrismaService } from '../prisma/prisma.service';
import { LiveClassGuard } from './guards/live-class.guard';

@Module({
  controllers: [AcademicController],
  providers: [VideoConferenceService, AcademicService, PrismaService, LiveClassGuard],
})
export class AcademicModule {}
