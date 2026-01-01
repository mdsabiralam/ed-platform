import { Module } from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { InvigilationController } from './invigilation.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InvigilationListener } from './listeners/invigilation.listener';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [InvigilationController],
  providers: [InvigilationService, InvigilationListener],
  exports: [InvigilationService],
})
export class InvigilationModule {}
