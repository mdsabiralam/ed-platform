import { Controller, Get, InternalServerErrorException } from '@nestjs/common';

@Controller('debug-crash')
export class DebugController {
  @Get()
  crash() {
    throw new Error('Test Crash 123');
  }
}
