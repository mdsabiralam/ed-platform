import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as dgram from 'dgram';
import { Redis } from 'ioredis';

@Injectable()
export class UdpListenerService implements OnModuleInit, OnModuleDestroy {
  private socket: dgram.Socket;
  private readonly logger = new Logger(UdpListenerService.name);
  private redis: Redis;

  constructor() {
    // Attempt to connect to Redis
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 1, // Don't retry indefinitely if Redis is down
        lazyConnect: true,
      });

      this.redis.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}. Pub/Sub will be disabled.`);
      });
    } catch (e) {
      this.logger.warn('Failed to initialize Redis client');
    }
  }

  async onModuleInit() {
    if (this.redis) {
        try {
            await this.redis.connect();
        } catch (e) {
            // Already handled by error listener usually, or just ignore for loose coupling
        }
    }

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      this.logger.error(`UDP Listener error:\n${err.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (msg, rinfo) => {
      this.handleMessage(msg, rinfo);
    });

    this.socket.bind(3000, () => {
      const address = this.socket.address();
      this.logger.log(`UDP Listener listening on ${address.address}:${address.port}`);
    });
  }

  onModuleDestroy() {
    this.socket.close();
    if (this.redis) {
      this.redis.disconnect();
    }
  }

  private handleMessage(msg: Buffer, rinfo: dgram.RemoteInfo) {
    try {
      // 2. Parse the hex to extract device_imei, lat, lng, and speed.
      // Expected format: Hex-encoded ASCII string of "IMEI,LAT,LNG,SPEED"
      // Example: "3132332C32332E382C39302E342C3435" -> "123,23.8,90.4,45"
      const hexString = msg.toString('utf8');

      // Decode hex to string
      let decoded = '';
      try {
          // If the buffer itself is the raw bytes of the string "123,..." then hex parsing isn't needed.
          // But requirement says "Parse the hex". Assuming the payload IS the hex string.
          // If we receive the raw bytes that form the hex string (e.g. 0x33 0x31...), we use toString.
          // If we receive the bytes of "123..." directly, we wouldn't call it "raw hex strings".
          // Let's support both or try to decode.

          if (/^[0-9A-Fa-f]+$/.test(hexString) && hexString.length % 2 === 0) {
              decoded = Buffer.from(hexString, 'hex').toString('utf8');
          } else {
              // Maybe it was already sent as text
              decoded = hexString;
          }
      } catch (e) {
          decoded = hexString;
      }

      this.logger.log(`UDP Decoded: ${decoded}`);

      const parts = decoded.split(',');
      if (parts.length < 4) {
          throw new Error('Invalid format');
      }

      const data = {
          device_imei: parts[0],
          lat: parseFloat(parts[1]),
          lng: parseFloat(parts[2]),
          speed: parseInt(parts[3], 10),
      };

      this.logger.log(`Received UDP from ${rinfo.address}:${rinfo.port}: ${JSON.stringify(data)}`);

      const routeId = 'route_1';

      // 3. Push this data immediately to a Redis Pub/Sub channel
      if (this.redis && this.redis.status === 'ready') {
        this.redis.publish(`bus_updates:${routeId}`, JSON.stringify(data));
      } else {
        this.logger.warn('Redis not ready, skipping publish');
      }

    } catch (e) {
      this.logger.error('Failed to parse UDP message');
    }
  }
}
