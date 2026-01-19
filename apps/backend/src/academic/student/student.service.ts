import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRemarkDto } from './student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async addRemark(studentId: string, dto: CreateRemarkDto) {
    // await this.prisma.studentRemark.create({
    //   data: {
    //     studentId,
    //     teacherId: dto.teacherId,
    //     text: dto.text,
    //     voiceUrl: dto.voiceData, // In real app, upload to S3 first
    //   }
    // });
    return { success: true, message: 'Remark added' };
  }
}
