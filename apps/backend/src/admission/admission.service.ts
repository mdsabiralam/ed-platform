import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatriculateDto } from './dto/matriculate.dto';
import { FinanceService } from '../finance/finance.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdmissionService {
  constructor(
    private prisma: PrismaService,
    private financeService: FinanceService
  ) {}

  async generateAdmissionNo(tenantId: string, tx: Prisma.TransactionClient): Promise<string> {
    // 4.D.02 Implement a concurrency-safe sequence generator for admission_no.
    // Use database locking (e.g., SELECT FOR UPDATE) to ensure no two students get the same Admission Number.

    // We update the counter atomically which is concurrency safe.
    // Alternatively we could select for update.
    // "SELECT FOR UPDATE" equivalent in Prisma is using raw query or finding with update.
    // But since we have a dedicated table, we can just update and increment.

    // First, ensure sequence exists
    // We cannot use upsert efficiently with locking in the same way for returning the old vs new value for sequence generation if we want strict control,
    // but atomic increment is safe.

    const prefix = 'ADM';

    // Attempt to update existing sequence
    let sequence = await tx.admissionSequence.findUnique({
      where: {
        tenantId_prefix: {
          tenantId,
          prefix
        }
      }
    });

    if (!sequence) {
      // Create if not exists (might race here if not careful, but unique constraint protects)
      try {
        sequence = await tx.admissionSequence.create({
          data: {
            tenantId,
            prefix,
            lastSeq: 0
          }
        });
      } catch (e) {
         // If race condition caused creation by another proc, fetch it
         sequence = await tx.admissionSequence.findUniqueOrThrow({
            where: { tenantId_prefix: { tenantId, prefix } }
         });
      }
    }

    // Now increment safely. Prisma update is atomic.
    const updated = await tx.admissionSequence.update({
      where: { id: sequence.id },
      data: { lastSeq: { increment: 1 } }
    });

    // Format: ADM-2024-001 (Example) or just ADM001
    // Let's use simple prefix + padded number
    const padded = updated.lastSeq.toString().padStart(6, '0');
    return `${prefix}${padded}`;
  }

  async matriculate(dto: MatriculateDto) {
    const { applicationId, targetClassId, targetSectionId } = dto;

    // 4.D.03 Core Logic

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Application
      const application = await tx.studentApplication.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new NotFoundException('Student application not found');
      }

      if (application.status === 'MATRICULATED') {
        throw new BadRequestException('Student already matriculated');
      }

      const tenantId = application.tenantId;

      // 4.D.02 Generate Admission No
      const admissionNo = await this.generateAdmissionNo(tenantId, tx);

      // 4.D.05 Transaction Step 2: Check if Parent User exists
      const orConditions: Prisma.UserWhereInput[] = [];
      if (application.parentEmail) {
        orConditions.push({ email: application.parentEmail });
      }
      if (application.parentPhone) {
        orConditions.push({ phone: application.parentPhone });
      }

      let parentUser: any = null;
      if (orConditions.length > 0) {
        parentUser = await tx.user.findFirst({
          where: { OR: orConditions }
        });
      }

      let parentUserId: string;

      if (!parentUser) {
        // Create new user
        // Generate temp password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Ensure email/phone uniqueness handles nulls if needed, but schema says unique.
        // If email is null, we can't search by it easily if it was unique index.
        // User email is unique in schema. If application.parentEmail is null, we generate a dummy or handle it.
        // Assuming parentEmail or parentPhone is provided.
        // If email is missing, we might use phone as identifier or placeholder.
        const emailToUse = application.parentEmail || `${application.parentPhone}@placeholder.com`;

        parentUser = await tx.user.create({
          data: {
            email: emailToUse,
            phone: application.parentPhone,
            passwordHash: hashedPassword,
            profiles: {
              create: {
                tenantId: tenantId,
                role: 'PARENT'
              }
            }
          }
        });
        parentUserId = parentUser.id;

        // Create Guardian Profile
        await tx.guardian.create({
          data: {
            userId: parentUserId
          }
        });

        // Send email/SMS with credentials (mocked/omitted for now)
      } else {
        parentUserId = parentUser.id;
        // Ensure they have a profile for this tenant
        const profile = await tx.profile.findUnique({
          where: {
            userId_tenantId: {
              userId: parentUserId,
              tenantId: tenantId
            }
          }
        });

        if (!profile) {
          await tx.profile.create({
            data: {
              userId: parentUserId,
              tenantId: tenantId,
              role: 'PARENT'
            }
          });
        }
      }

      const guardian = await tx.guardian.findUnique({ where: { userId: parentUserId } });
      if (!guardian) {
         // Should have been created above or exists
         // If user existed but not as guardian (maybe as staff), create guardian entry?
         // User one-to-one with Guardian? Schema: guardian Guardian?
         await tx.guardian.create({ data: { userId: parentUserId }});
      }

      const guardianId = (await tx.guardian.findUniqueOrThrow({ where: { userId: parentUserId } })).id;

      // 4.D.09 Auto-assign roll_no
      // Fetch max roll number for target section
      const maxRoll = await tx.student.aggregate({
        where: {
          sectionId: targetSectionId,
          tenantId: tenantId
        },
        _max: {
          rollNo: true
        }
      });
      const nextRollNo = (maxRoll._max.rollNo || 0) + 1;

      // 4.D.04 Transaction Step 1: INSERT INTO students
      // 4.D.06 Transaction Step 3: Link to class/section (implicitly done via sectionId)

      const student = await tx.student.create({
        data: {
          tenantId: tenantId,
          admissionSessionId: application.admissionSessionId,
          sectionId: targetSectionId,
          classId: targetClassId,
          firstName: application.firstName,
          lastName: application.lastName,
          admissionNo: admissionNo,
          rollNo: nextRollNo,
          // user: { } // Create student user? Prompt doesn't explicitly ask for Student User, only Parent User check.
          // But Student usually needs login too.
          // "Check if the Parent User already exists... If not, create a new record...".
          // It doesn't mention creating Student User account. I'll skip Student User creation for now.
        }
      });

      // Link Parent to Student
      await tx.parentStudentMapping.create({
        data: {
          studentId: student.id,
          guardianId: guardianId,
          relationship: 'Parent' // Default
        }
      });

      // 4.D.07 Transaction Step 4: Call Finance Module
      // We are in a transaction. Ideally FinanceService should accept the transaction object.
      // But FinanceService is mocked. If we want to test atomicity by failing this step, we can do it here.

      try {
        // If we really need to test atomicity by failing Step 4, we can throw here based on some input flag or mock behavior.
        // But for real implementation:
        await this.financeService.initializeFeeLedger(student.id, tenantId);

        // Also create the explicit ledger entry requested in the plan/memory if FinanceService doesn't do it directly in this DB.
        // The instructions say "Call the Finance Module service to initialize the fee_ledger. Create an opening balance record for the student."
        // Since I control the DB schema now, I can insert it here to be safe and atomic.
        await tx.studentFeeLedger.create({
          data: {
            tenantId: tenantId,
            studentId: student.id,
            transactionType: 'OPENING_BALANCE',
            amount: 0, // Or some default fee?
            status: 'PAID',
            description: 'Opening Balance on Matriculation'
          }
        });

      } catch (error) {
        throw new InternalServerErrorException('Failed to initialize fee ledger');
      }

      // 4.D.08 Transaction Step 5: Update student_applications
      await tx.studentApplication.update({
        where: { id: applicationId },
        data: {
          status: 'MATRICULATED',
          studentId: student.id
        }
      });

      return student;
    });
  }
}
