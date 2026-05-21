'use server';

import prisma from '@/lib/db';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getCurrentUserId } from '@/lib/user';
import { getOrganizationId } from '@/lib/organization';
import { AttendanceStatus } from '@/generated/prisma/enums';

export type ChildSummary = {
  id: string;
  profileImage: string | null;
  firstName: string;
  lastName: string;
  fullName: string | null;
  dateOfBirth: Date;
  phoneNumber: string;
  rollNumber: string;
  gender: string;
  grade: { id: string; grade: string } | null;
  section: { id: string; name: string } | null;
  attendance: {
    id: string;
    date: Date;
    status: AttendanceStatus;
  }[];
  pendingFees: number;
  totalFees: number;
};

export async function getChildrenByParent(): Promise<ChildSummary[]> {
  const [academicYearId, userId, organizationId] = await Promise.all([
    getActiveAcademicYearId(),
    getCurrentUserId(),
    getOrganizationId(),
  ])

  const parentStudents = await prisma.parentStudent.findMany({
    where: {
      parent: { userId, organizationId },
      student: { organizationId },
    },
    orderBy: [
      { isPrimary: 'desc' },
      { student: { firstName: 'asc' } },
    ],
    select: {
      student: {
        select: {
          id: true,
          profileImage: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dateOfBirth: true,
          phoneNumber: true,
          rollNumber: true,
          gender: true,
          grade: { select: { id: true, grade: true } },
          section: { select: { id: true, name: true } },
          StudentAttendance: {
            orderBy: { date: 'desc' },
            take: 30,
            select: { id: true, date: true, status: true },
          },
          // Fee summary — current academic year only
          Fee: academicYearId
            ? {
              where: { organizationId, academicYearId },
              select: { totalFee: true, paidAmount: true, pendingAmount: true },
            }
            : { where: { organizationId }, select: { totalFee: true, paidAmount: true, pendingAmount: true } },
        },
      },
    },
  });

  return parentStudents.map(({ student }) => ({
    id: student.id,
    profileImage: student.profileImage,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth,
    phoneNumber: student.phoneNumber,
    rollNumber: student.rollNumber,
    gender: student.gender,
    grade: student.grade,
    section: student.section,
    attendance: student.StudentAttendance.map((a) => ({
      id: a.id,
      date: a.date,
      status: a.status as AttendanceStatus,
    })),
    pendingFees: student.Fee.reduce(
      (sum, f) => sum + (f.pendingAmount ?? Math.max(0, f.totalFee - f.paidAmount)),
      0
    ),
    totalFees: student.Fee.reduce((sum, f) => sum + f.totalFee, 0),
  }));
}

