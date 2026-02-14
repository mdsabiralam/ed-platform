import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class VideoConferenceService {
  /**
   * Generates a unique Jitsi Meet link.
   * Format: https://meet.jit.si/ed_school_${routineId}_${secureRandom}
   */
  generateJitsiLink(routineId: string): string {
    const randomString = crypto.randomBytes(4).toString('hex');
    const roomName = `ed_school_${routineId}_${randomString}`;
    return `https://meet.jit.si/${roomName}`;
  }
}
