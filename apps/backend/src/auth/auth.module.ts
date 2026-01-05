import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
