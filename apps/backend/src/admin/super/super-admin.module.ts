import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SuperAdminController],
})
export class SuperAdminModule {}
