import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Fake success for security
      return;
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expires in 15 minutes

    // Save to OtpLog
    await this.prisma.otpLog.create({
      data: {
        email: user.email,
        otpCode: code,
        expiresAt: expiresAt,
        isUsed: false,
      },
    });

    // In a real application, we would send the email here.
    // console.log(`[Mock Email] Sending password reset code ${code} to ${email}`);
  }
}
