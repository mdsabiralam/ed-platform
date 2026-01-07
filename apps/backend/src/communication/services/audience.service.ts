import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BroadcastFilterDto } from '../dto/broadcast-filter.dto';

@Injectable()
export class AudienceService {
  constructor(private prisma: PrismaService) {}

  async fetchUsers(filter: BroadcastFilterDto) {
    const whereClause: any = {
      deletedAt: null,
    };

    if (filter.classId) {
      whereClause.student = {
        section: {
          classId: filter.classId,
        },
      };
    }

    // We fetch users and their related data to check fee status or provide data for templates
    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        student: {
            include: {
                feeLedger: true,
                section: true
            }
        },
        staffProfile: true
      }
    });

    if (filter.feeDefaulter) {
        return users.filter(u => {
            const ledger = u.student?.feeLedger;
            if (!ledger) return false;
            return (ledger.totalInvoiced - ledger.totalPaid) > 0;
        });
    }

    return users;
  }
}
