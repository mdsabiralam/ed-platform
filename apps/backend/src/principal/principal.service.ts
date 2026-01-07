import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrincipalService {
  constructor(private prisma: PrismaService) {}

  async getPendingApprovals() {
    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: { staff: { include: { user: true } }, leaveType: true },
    });
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: { status: 'PENDING' },
      include: { requester: { include: { user: true } } },
    });
    return { leaveRequests, purchaseOrders };
  }

  async approveLeave(id: string) {
    // In a real app, update leave balance here
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async rejectLeave(id: string, reason: string) {
    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason },
    });
  }

  async getStaffAttendanceStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mocking real-time socket data source by querying DB
    const totalStaff = await this.prisma.staffProfile.count();
    const present = await this.prisma.staffAttendance.count({
      where: { date: { gte: today }, status: 'PRESENT' },
    });
    const absent = await this.prisma.staffAttendance.findMany({
      where: { date: { gte: today }, status: 'ABSENT' },
      include: { staff: { include: { user: true } } },
    });

    return {
      totalStaff,
      presentCount: present,
      absentCount: absent.length,
      absentList: absent.map(a => ({
        name: a.staff.user.email, // Fallback as User model lacks firstName/lastName
        designation: a.staff.designation,
      })),
    };
  }

  async createObservation(data: any) {
    return this.prisma.classObservation.create({
      data: {
        tenantId: data.schoolId, // Assuming passed in body
        teacherId: data.teacherId,
        observerId: data.observerId,
        subject: data.subject,
        rating: data.rating,
        remarks: data.remarks,
        criteriaScores: data.criteriaScores,
      },
    });
  }

  async globalSearch(query: string) {
    // Concurrent search
    const students = await this.prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { admissionNo: { contains: query } },
        ],
      },
      take: 5,
    });

    const staff = await this.prisma.staffProfile.findMany({
      where: {
        user: {
           OR: [
             // { email: { contains: query, mode: 'insensitive' } }, // Check User model fields
           ]
        }
      },
      include: { user: true },
      take: 5,
    });

    return { students, staff };
  }

  async sendBroadcast(data: any) {
    // Mock broadcast logic
    return { success: true, recipients: 100 };
  }

  async getFinancialPulse() {
    // Mock secure finance data
    return {
      todayCollection: 50000,
      monthRevenue: 1200000,
    };
  }

  async getDefaulters() {
    // Mock defaulter list
    return [
      { name: 'John Doe', class: '10-A', amount: 5000, phone: '1234567890' },
      { name: 'Jane Smith', class: '8-B', amount: 3000, phone: '0987654321' },
    ];
  }

  async getSubstitutionView() {
    // Mock substitution view logic
    // 1. Get absent teachers
    // 2. Get their schedule
    // 3. Suggest free teachers
    return {
      absentTeachers: [],
      suggestions: [],
    };
  }

  async assignSubstitute(data: any) {
    return this.prisma.substitution.create({
      data: {
        tenantId: data.schoolId,
        routineEntryId: data.routineEntryId,
        originalTeacherId: data.originalTeacherId,
        substituteTeacherId: data.substituteTeacherId,
        date: new Date(),
        status: 'ASSIGNED',
      },
    });
  }
}
