import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

export interface BroadcastFilterDto {
  classId?: string;
  defaultersOnly?: boolean;
}

@Injectable()
export class AudienceService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchUsers(filter: BroadcastFilterDto): Promise<User[]> {
    const whereClause: any = {};

    // Filter by Class
    if (filter.classId) {
      whereClause.student = {
        section: {
          classId: filter.classId,
        },
      };
    }

    // Filter by Fee Defaulters
    if (filter.defaultersOnly) {
      // Ensure we're querying users who are students (or parents of students)
      // For simplicity, we assume we target students directly linked to users
      // Ideally, we'd traverse student -> feeLedger
      whereClause.student = {
        ...(whereClause.student || {}),
        feeLedger: {
          totalInvoiced: {
            gt:  {
                // We can't reference 'totalPaid' directly in 'gt' in Prisma directly like SQL "totalInvoiced > totalPaid"
                // Prisma doesn't support comparing two columns in the same row easily without raw query or filtering in-memory
                // For now, let's fetch students with feeLedger and filter in JS if needed
                // OR assuming we can't do column comparison easily, we might need a raw query or computed field.
                // However, the prompt says "join with the Fee table to find students with dueAmount > 0"
                // Let's rely on finding students where feeLedger exists first.
             }
          }
        }
      };
    }

    // Since Prisma doesn't support column-to-column comparison in where clause (e.g. totalInvoiced > totalPaid),
    // we fetch candidates and filter them in memory for defaulters.
    // Optimization: Use raw query for large datasets.

    let users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            feeLedger: true,
          }
        }
      }
    });

    if (filter.defaultersOnly) {
      users = users.filter(user => {
        const ledger = user.student?.feeLedger;
        if (!ledger) return false;
        return (ledger.totalInvoiced - ledger.totalPaid) > 0;
      });
    }

    return users;
  }
}
