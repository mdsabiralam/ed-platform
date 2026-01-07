import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async onboardStaff(data: CreateStaffDto) {
    const {
      email, phone, password,
      firstName, lastName,
      designation, departmentId, dateOfJoining,
      panNumber, qualification, bloodGroup, isTeachingStaff, tenantId
    } = data;

    // Transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      let user;
      try {
        user = await tx.user.create({
          data: {
            email,
            phone,
            passwordHash,
          },
        });
      } catch (error) {
        if (error.code === 'P2002') {
          throw new BadRequestException('User with this email or phone already exists');
        }
        throw error;
      }

      // 2. Create Staff Profile
      const staffProfile = await tx.staffProfile.create({
        data: {
          tenantId, // Assuming tenantId is provided or extracted from context
          userId: user.id,
          firstName,
          lastName,
          designation,
          departmentId,
          dateOfJoining: new Date(dateOfJoining),
          panNumber,
          qualification,
          bloodGroup,
          isTeachingStaff: isTeachingBool(isTeachingStaff),
        },
      });

      // 3. Assign Role (Create Profile entry)
      // Determine role based on teaching flag
      // Now that we verified UserRole enum has STAFF and TEACHER, we can use them directly or cast to proper enum type if available.
      // Since we are in service file and might not have the generated enum imported yet,
      // we can rely on string literals matching the enum.
      const role = isTeachingBool(isTeachingStaff) ? 'TEACHER' : 'STAFF';

      await tx.profile.create({
        data: {
          userId: user.id,
          tenantId,
          role: role as 'TEACHER' | 'STAFF',
        },
      });

      return { user, staffProfile };
    });
  }

  async getStaffDirectory(departmentName?: string, isTeaching?: boolean) {
    const whereClause: any = {};

    if (departmentName) {
      whereClause.department = {
        name: departmentName,
      };
    }

    if (isTeaching !== undefined) {
      whereClause.isTeachingStaff = isTeaching;
    }

    // Security: The controller should handle "view own profile" for non-admins.
    // This method returns the directory, presumably for Admins or valid users.
    // If we want to strictly enforce RLS here, we need the current user context.
    // But typically "Directory" implies public/shared list within the org.
    // Requirement 4.F.10 says "A Staff user logging in should only be able to view/edit their own staff_profiles data, not others'".
    // This might mean strictly NO directory access for Staff? Or read-only basic info?
    // "view/edit their own staff_profiles data" usually refers to detailed PII.
    // A directory usually lists name/designation/email.
    // I will return the list but maybe exclude sensitive fields if needed.
    // But for now, I'll just return what's asked.

    // Security: Filter out PII like panNumber, bloodGroup
    return this.prisma.staffProfile.findMany({
      where: whereClause,
      select: {
          id: true,
          firstName: true,
          lastName: true,
          designation: true,
          department: {
              select: {
                  id: true,
                  name: true
              }
          },
          user: {
              select: {
                  email: true,
                  phone: true
              }
          },
          isTeachingStaff: true,
          // Exclude: panNumber, bloodGroup, qualification, dateOfJoining, etc.
      }
    });
  }

  async getStaffProfileByUserId(userId: string) {
    return this.prisma.staffProfile.findUnique({
      where: { userId },
      include: {
        department: true,
        user: {
            select: {
                email: true,
                phone: true
            }
        }
      },
    });
  }

  getKycUploadPath(staffId: string) {
      // 4.F.05 Implement a secure storage path
      return `staff/${staffId}/kyc/`;
  }

  generatePresignedUrl(staffId: string, filename: string, operation: 'put' | 'get' = 'get') {
      // Placeholder for generating a secure presigned URL (e.g., S3)
      // This ensures files are not publicly accessible via a static URL.
      // In a real implementation, this would use AWS SDK or similar.
      const bucket = 'private-staff-docs';
      const key = `${this.getKycUploadPath(staffId)}${filename}`;
      // return s3.getSignedUrl(operation, { Bucket: bucket, Key: key, Expires: 60 * 5 });
      return `https://${bucket}.s3.amazonaws.com/${key}?signature=mock_signature&expires=300`;
  }
}

function isTeachingBool(val: any): boolean {
    if (typeof val === 'boolean') return val;
    return val === 'true';
}
