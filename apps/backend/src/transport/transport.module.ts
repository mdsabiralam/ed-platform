import { Module } from '@nestjs/common';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';
import { UdpListenerService } from './udp.listener.service';

@Module({
  controllers: [TransportController],
  providers: [TransportService, UdpListenerService],
})
export class TransportModule {}
