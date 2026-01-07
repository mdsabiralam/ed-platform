import { Module } from '@nestjs/common';
import { PrincipalController } from './principal.controller';
import { PrincipalService } from './principal.service';

@Module({
  controllers: [PrincipalController],
  providers: [PrincipalService],
})
export class PrincipalModule {}
