import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class StudentApplicationService {
  constructor(private prisma: PrismaService) {}

  // 4.B.06
  async generateApplicationSerialNo(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();

    // Atomic update using AdmissionSequence
    // UPSERT sequence record: if not exists create with lastSeq=1, else increment lastSeq
    // Since Prisma upsert does not support returning the updated value in an atomic way easily combined with logic inside
    // We can use update with increment.

    // First try to upsert to ensure it exists or increment.
    // However, upsert needs unique input.
    // If we use upsert:
    // create: { tenantId, year, lastSeq: 1 }
    // update: { lastSeq: { increment: 1 } }
    // This is atomic.

    const seq = await this.prisma.admissionSequence.upsert({
        where: {
            tenantId_year: {
                tenantId,
                year
            }
        },
        create: {
            tenantId,
            year,
            lastSeq: 1
        },
        update: {
            lastSeq: { increment: 1 }
        }
    });

    const sequence = seq.lastSeq;
    return `APP/${year}/${String(sequence).padStart(4, '0')}`;
  }

  // 4.B.07
  async apply(dto: CreateApplicationDto) {
    const { id, status, personal_details, guardian_details, previous_school_history, school_id } = dto;
    const isDraft = status === 'Draft' || !status;

    // Validate if submitted
    if (!isDraft && status === 'Submitted') {
       // 4.B.02 Logic: "It must require father_name, mother_name, and primary_mobile."
       const gd = guardian_details || {};
       if (!gd.father_name || !gd.mother_name || !gd.primary_mobile) {
           throw new BadRequestException('Guardian details (father_name, mother_name, primary_mobile) are required for submission.');
       }
    }

    let applicationId = id;

    if (!applicationId) {
        // Create new
        const serialNo = await this.generateApplicationSerialNo(school_id);
        return this.prisma.studentApplication.create({
            data: {
                tenantId: school_id,
                serialNo: serialNo,
                status: isDraft ? 'Draft' : 'Submitted',
                personalDetails: personal_details || {},
                guardianDetails: guardian_details || {},
                previousSchoolHistory: previous_school_history || {},
            }
        });
    } else {
        // Upsert logic
        // If ID provided, we want to update if exists. If not exists, we cannot easily create with that ID AND generate serial.
        // Assuming client sends ID only for existing drafts.
        // But prompt says "Upsert (Update if exists, Insert if new) based on a draft ID".
        // This usually means if client sends a draft ID (maybe generated on client or previously saved), we use it.
        // If it's a client generated UUID, we can support creating it.

        // Let's use upsert.
        // But for create, we need serial number.
        // We can't use `upsert` easily because `create` part needs async call to generateSerialNo which `upsert` doesn't support inside.
        // So we stick to findUnique check or we generate serial number anyway? generating serial number increments counter, so we shouldn't do it if not needed.

        const existing = await this.prisma.studentApplication.findUnique({ where: { id: applicationId } });

        if (existing) {
             return this.prisma.studentApplication.update({
                 where: { id: applicationId },
                 data: {
                     status: isDraft ? 'Draft' : 'Submitted',
                     personalDetails: personal_details || existing.personalDetails,
                     guardianDetails: guardian_details || existing.guardianDetails,
                     previousSchoolHistory: previous_school_history || existing.previousSchoolHistory,
                 }
             });
        } else {
             const serialNo = await this.generateApplicationSerialNo(school_id);
             return this.prisma.studentApplication.create({
                data: {
                    id: applicationId,
                    tenantId: school_id,
                    serialNo: serialNo,
                    status: isDraft ? 'Draft' : 'Submitted',
                    personalDetails: personal_details || {},
                    guardianDetails: guardian_details || {},
                    previousSchoolHistory: previous_school_history || {},
                }
            });
        }
    }
  }
}
