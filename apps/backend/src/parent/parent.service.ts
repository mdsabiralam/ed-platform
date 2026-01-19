import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  async getChildren(userId: string) {
    // 1. Find Guardian profile linked to this User
    const guardian = await this.prisma.guardian.findUnique({
      where: { userId },
      include: {
        students: {
          include: {
            student: {
              include: {
                section: {
                  include: {
                    class: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!guardian) {
      return [];
    }

    // Return the student list flattened
    return guardian.students.map(mapping => ({
      id: mapping.student.id,
      firstName: mapping.student.firstName,
      lastName: mapping.student.lastName,
      admissionNo: mapping.student.admissionNo,
      className: mapping.student.section?.class?.name,
      sectionName: mapping.student.section?.name,
    }));
  }
}
