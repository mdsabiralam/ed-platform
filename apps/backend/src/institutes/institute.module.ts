import { Module } from '@nestjs/common';
import { InstituteService } from './institute.service';
import { InstituteController } from './institute.controller';

@Module({
  controllers: [InstituteController],
  providers: [InstituteService],
})
export class InstituteModule {}
