import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FcmService } from './fcm.service';
import { DeviceController } from './device.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Assuming standard path

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [DeviceController],
  providers: [FcmService],
  exports: [FcmService],
})
export class CommunicationModule {}
