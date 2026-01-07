import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Fake success for security
      return;
    }

    // Generate a 6-digit code using CSPRNG
    const code = crypto.randomInt(100000, 1000000).toString();
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
    console.log(`[Mock SMS/Email] Sending password reset code ${code} to ${email}`);
  }

  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const otpRecord = await this.prisma.otpLog.findFirst({
      where: {
        email,
        otpCode: otp,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or used OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark as used
    await this.prisma.otpLog.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Generate Temporary Reset Token
    const payload = { email, purpose: 'password_reset' };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '10m' });

    return { resetToken };
  }
}
