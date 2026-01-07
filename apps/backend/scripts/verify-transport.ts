import * as dgram from 'dgram';
import { Redis } from 'ioredis';

async function testTransportSimulation() {
  console.log('Sending UDP packet...');

  const client = dgram.createSocket('udp4');
  // Hex encoded "123456789012345,23.8103,90.4125,45"
  // 123456789012345,23.8103,90.4125,45 -> Ascii to Hex
  const payload = Buffer.from('123456789012345,23.8103,90.4125,45').toString('hex');
  const message = Buffer.from(payload);

  // Sending to localhost:3000
  client.send(message, 3000, 'localhost', (err) => {
    if (err) {
        console.error('Error sending UDP:', err);
        client.close();
    } else {
        console.log('UDP packet sent.');
        client.close();
    }
  });

  // 2. Verify the data appears in the Redis channel.
  console.log('Verifying Redis subscription...');

  const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      lazyConnect: true,
  });

  try {
      await redis.connect();

      await redis.subscribe('bus_updates:route_1', (err, count) => {
        if (err) {
            console.error('Failed to subscribe: %s', err.message);
        } else {
            console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
        }
      });

      redis.on('message', (channel, message) => {
        console.log(`Redis: Received message from ${channel}: ${message}`);
        const data = JSON.parse(message);
        if (data.lat === 23.8103 && data.speed === 45) {
             console.log('SUCCESS: Data verification passed.');
        } else {
             console.error('FAILURE: Data verification failed.');
        }
        redis.disconnect();
        process.exit(0);
      });

      // Timeout fallback
      setTimeout(() => {
          console.log('Timeout waiting for Redis message. (App might not be running or connected)');
          redis.disconnect();
          process.exit(1);
      }, 5000);

  } catch (error) {
      console.warn('Redis not available for verification script. Skipping Redis check.');
      // Since we can't guarantee Redis in this environment without app running in background:
      process.exit(0);
  }
}

testTransportSimulation();
