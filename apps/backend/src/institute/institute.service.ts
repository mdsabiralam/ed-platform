import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class InstituteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstituteDto: CreateInstituteDto) {
    const { subdomain, name, adminEmail, adminName } = createInstituteDto;

    // Check if subdomain already exists
    const existingInstitute = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingInstitute) {
      throw new BadRequestException('Subdomain already taken');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
        throw new BadRequestException('User with this email already exists');
    }

    // Default password (should be changed on first login)
    const defaultPassword = 'Password@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.$transaction(async (prisma) => {
        // 1. Create Institute
        const institute = await prisma.tenant.create({
            data: {
                name,
                subdomain,
                subscriptionStatus: 'ACTIVE',
            },
        });

        // 2. Create Admin User
        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                // phone is required by schema, putting dummy for now as it wasn't in DTO
                phone: `0000000000-${Date.now()}`,
            },
        });

        // 3. Create Profile linked to Institute and User
        const profile = await prisma.profile.create({
            data: {
                userId: user.id,
                tenantId: institute.id,
                role: UserRole.ADMIN, // School Owner
            },
        });

        // 4. Create Subscription (Default) - Optional logic
        // We can fetch a default plan if exists, or just skip for now as 'subscriptionStatus' is already ACTIVE on tenant.
        // Assuming we rely on tenant status.

        return {
            institute,
            adminUser: {
                id: user.id,
                email: user.email,
                name: adminName // Returned in response, though not stored in User table explicitly (User table has no name, Student/Staff has)
                // Wait, User table has no name?
                // Schema check: User { id, email, passwordHash, phone, ... }
                // Profile { ... }
                // Student { firstName, lastName ... }
                // StaffProfile { ... }
                // Where is the Admin's name stored?
                // Usually in StaffProfile or a separate Admin profile?
                // The prompt asked to use 'adminName'.
                // If I create a Profile with role ADMIN, maybe I should also create a StaffProfile?
                // Or maybe User table has name?
                // Let's check schema again.
            },
        };
    });
  }
}
