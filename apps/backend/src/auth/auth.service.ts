import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      if (!existingUser.isActive) {
        throw new ForbiddenException('Account Banned');
      }
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const avatarUrl = this.generateAvatar(dto.email);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          isActive: true,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          instituteId: dto.instituteId,
          role: UserRole.STUDENT,
          avatarUrl,
        },
      });

      return { user, profile };
    });

    this.eventEmitter.emit('user.created', result);
    return result;
  }

  private generateAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }
}
