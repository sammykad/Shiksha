'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getOrganizationFeeSummary } from '@/lib/data/fee/fee-balance';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { toISTDate } from '@/lib/utils';

export async function getStudentStats() {
  const organizationId = await getOrganizationId();
  const today = toISTDate(new Date());

  const [
    totalStudents,
    activeStudents,
    newAdmissionsThisMonth,
    todayAttendanceTotal,
    presentTodayCount,
    lateTodayCount,
  ] = await Promise.all([
    prisma.student.count({
      where: {
        organizationId,
      },
    }),

    // Active Students (those with recent attendance)
    prisma.student.count({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
    }),

    // New Admissions This Month
    prisma.student.count({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // Today's Attendance Total
    prisma.studentAttendance.count({
      where: {
        section: { organizationId },
        date: today,
      },
    }),

    // Today's Present Students (strictly Present)
    prisma.studentAttendance.count({
      where: {
        section: { organizationId },
        date: today,
        status: 'PRESENT',
      },
    }),

    // Today's Late Students
    prisma.studentAttendance.count({
      where: {
        section: { organizationId },
        date: today,
        status: 'LATE',
      },
    }),
  ]);

  const presentToday = presentTodayCount;
  const lateToday = lateTodayCount;
  const totalAttendanceRecords = todayAttendanceTotal;
  const attendancePercentage =
    activeStudents > 0
      ? Math.round(((presentToday + lateToday) / activeStudents) * 100)
      : 0;

  return {
    totalStudents,
    activeStudents,
    newAdmissionsThisMonth,
    presentToday,
    lateToday,
    totalAttendanceRecords,
    attendancePercentage,
  };
}

export async function getTeacherStats() {
  const organizationId = await getOrganizationId();

  const [totalTeachers, activeTeachers, newTeachersThisMonth] =
    await Promise.all([
      // Total Teachers
      prisma.teacher.count({
        where: { organizationId },
      }),

      // Active Teachers
      prisma.teacher.count({
        where: {
          organizationId,
          isActive: true,
          employmentStatus: 'ACTIVE',
        },
      }),

      // New Teachers This Month
      prisma.teacher.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

  return {
    totalTeachers,
    activeTeachers,
    newTeachersThisMonth,
  };
}

export async function getRevenueStats() {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();

  if (!academicYearId) {
    return {
      totalRevenue: 0,
      collectedRevenue: 0,
      pendingRevenue: 0,
      revenuePercentage: 0,
      overdueFeesCount: 0,
      thisMonthCollection: 0,
    };
  }

  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const [summary, thisMonthCollection] = await Promise.all([
    getOrganizationFeeSummary(organizationId, academicYearId),
    prisma.feePayment.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
        paymentDate: { gte: currentMonth },
        fee: {
          academicYearId,
        },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalRevenue: summary.totalAmount,
    collectedRevenue: summary.paidAmount,
    pendingRevenue: summary.dueAmount,
    revenuePercentage: summary.collectionPercent,
    overdueFeesCount: summary.overdueFeesCount,
    thisMonthCollection: thisMonthCollection._sum.amount || 0,
  };
}

export async function getIssuesStats() {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();

  const [totalIssues, pendingIssues, resolvedIssues, criticalIssues] =
    await Promise.all([
      prisma.anonymousComplaint.count({
        where: {
          organizationId,
          academicYearId,
        },
      }),

      prisma.anonymousComplaint.count({
        where: {
          organizationId,
          academicYearId,
          currentStatus: { in: ['PENDING', 'UNDER_REVIEW', 'INVESTIGATING'] },
        },
      }),

      prisma.anonymousComplaint.count({
        where: {
          organizationId,
          academicYearId,
          currentStatus: 'RESOLVED',
        },
      }),

      prisma.anonymousComplaint.count({
        where: {
          organizationId,
          academicYearId,
          severity: 'CRITICAL',
          currentStatus: { not: 'RESOLVED' },
        },
      }),
    ]);

  return {
    totalIssues,
    pendingIssues,
    resolvedIssues,
    criticalIssues,
  };
}
