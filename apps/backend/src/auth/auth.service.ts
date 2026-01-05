import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.$transaction(async (tx) => {
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
          role: UserRole.ADMIN,
        },
      });

      return { user, profile };
    });
  }
}
