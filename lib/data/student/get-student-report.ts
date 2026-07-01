// lib/actions/student-report.ts
"use server"

import prisma from "@/lib/db";
import { getOrganizationId } from "@/lib/organization";
import { getActiveAcademicYearId } from "@/lib/academicYear";
import { Prisma } from "@/generated/prisma/client";
import { getFeeBalance } from "@/lib/data/fee/fee-balance";
import { getOrganizationWeekendDays } from '@/lib/data/organization/get-organization-weekend-days';
import { countWorkingDays } from '@/lib/data/attendance/attendance-utils';
import { toISTDate } from '@/lib/utils';

interface GetStudentReportOptions {
  studentId: string;
  academicYearId?: string;
  includeSections?: {
    feeDetails?: boolean;
    attendance?: boolean;
    examResults?: boolean;
    leaveRecords?: boolean;
  };
}

type FeeData = Prisma.FeeGetPayload<{
  select: {
    id: true;
    totalFee: true;
    paidAmount: true;
    pendingAmount: true;
    dueDate: true;
    status: true;
    feeCategory: {
      select: {
        id: true;
        name: true;
        description: true;
      };
    };
    payments: {
      select: {
        id: true;
        amount: true;
        status: true;
        paymentMethod: true;
        paymentDate: true;
        receiptNumber: true;
        transactionId: true;
        payer: {
          select: {
            firstName: true;
            lastName: true;
            email: true;
          };
        };
      };
    };
  };
}>[];

type AttendanceData = Prisma.StudentAttendanceGetPayload<{
  select: {
    id: true;
    date: true;
    status: true;
    note: true;
  };
}>[];

type ExamResultData = Prisma.ExamResultGetPayload<{
  select: {
    id: true;
    obtainedMarks: true;
    percentage: true;
    gradeLabel: true;
    remarks: true;
    isPassed: true;
    isAbsent: true;
    exam: {
      select: {
        id: true;
        title: true;
        maxMarks: true;
        startDate: true;
        subject: {
          select: {
            id: true;
            name: true;
            code: true;
          };
        };
        examSession: {
          select: {
            id: true;
            title: true;
          };
        };
      };
    };
  };
}>[];

type LeaveData = Prisma.LeaveGetPayload<{
  select: {
    id: true;
    startDate: true;
    endDate: true;
    totalDays: true;
    reason: true;
    type: true;
    currentStatus: true;
    approvedBy: true;
    approvedAt: true;
    rejectedNote: true;
  };
}>[];



export const getStudentReport = async ({
  studentId,
  academicYearId: providedAcademicYearId,
  includeSections = {
    feeDetails: true,
    attendance: true,
    examResults: false,
    leaveRecords: false,
  }
}: GetStudentReportOptions) => {

  const organizationId = await getOrganizationId();
  const academicYearId = providedAcademicYearId || await getActiveAcademicYearId();

  // Base queries that are always needed
  const organizationQuery = prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      contactPhone: true,
      logo: true,
      organizationType: true,
      website: true
    }
  });

  const studentQuery = prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      userId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      fullName: true,
      rollNumber: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      dateOfBirth: true,
      address: true,
      gender: true,
      createdAt: true, // Used as Admission Date
      grade: {
        select: {
          id: true,
          grade: true
        }
      },
      section: {
        select: {
          id: true,
          name: true
        }
      },
      parents: {
        where: { isPrimary: true },
        select: {
          isPrimary: true,
          parent: {
            select: {
              userId: true,
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              whatsAppNumber: true,
            }
          }
        }
      }
    }
  });

  const academicYearQuery = prisma.academicYear.findUnique({
    where: { id: academicYearId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true
    }
  });

  const studentUserId = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      userId: true
    }
  });

  // Conditional queries with proper typing
  const feesQuery: Promise<FeeData> = includeSections.feeDetails !== false
    ? prisma.fee.findMany({
      where: {
        studentId: studentId,
        academicYearId: academicYearId
      },
      select: {
        id: true,
        totalFee: true,
        paidAmount: true,
        pendingAmount: true,
        dueDate: true,
        status: true,
        feeCategory: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            paymentDate: true,
            receiptNumber: true,
            transactionId: true,
            payer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          },
          orderBy: { paymentDate: 'desc' }
        }
      }
    })
    : Promise.resolve([]);

  const attendanceQuery: Promise<AttendanceData> = includeSections.attendance
    ? prisma.studentAttendance.findMany({
      where: {
        studentId: studentId,
        academicYearId: academicYearId
      },
      select: {
        id: true,
        date: true,
        status: true,
        note: true,
      },
      orderBy: { date: 'desc' }
    })
    : Promise.resolve([]);

  const examResultsQuery: Promise<ExamResultData> = includeSections.examResults
    ? prisma.examResult.findMany({
      where: {
        studentId: studentId,
        exam: {
          examSession: {
            academicYearId: academicYearId
          }
        }
      },
      select: {
        id: true,
        obtainedMarks: true,
        percentage: true,
        gradeLabel: true,
        remarks: true,
        isPassed: true,
        isAbsent: true,
        exam: {
          select: {
            id: true,
            title: true,
            maxMarks: true,
            startDate: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            examSession: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })
    : Promise.resolve([]);

  const leavesQuery: Promise<LeaveData> = includeSections.leaveRecords
    ? prisma.leave.findMany({
      where: {
        userId: studentUserId?.userId,
        academicYearId: academicYearId
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalDays: true,
        reason: true,
        type: true,
        currentStatus: true,
        approvedBy: true,
        approvedAt: true,
        rejectedNote: true
      },
      orderBy: { startDate: 'desc' }
    })
    : Promise.resolve([]);



  // Execute all queries with proper typing
  const [
    organization,
    student,
    academicYear,
    fees,
    attendance,
    examResults,
    leaves,
    weekendDays,
    holidays,
  ] = await Promise.all([
    organizationQuery,
    studentQuery,
    academicYearQuery,
    feesQuery,
    attendanceQuery,
    examResultsQuery,
    leavesQuery,
    getOrganizationWeekendDays(),
    prisma.academicCalendar.findMany({
      where: { organizationId, academicYearId },
      select: { startDate: true, endDate: true },
    }),
  ]);

  // Calculate fee summary with proper null checks
  const feeSummary = fees.reduce((summary, fee) => {
    const balance = getFeeBalance(fee);
    summary.totalFees += balance.totalAmount;
    summary.totalPaid += balance.paidAmount;
    summary.totalPending += balance.dueAmount;
    summary.totalOverDue += balance.status === 'OVERDUE' ? balance.dueAmount : 0;
    return summary;
  }, { totalFees: 0, totalPaid: 0, totalPending: 0, totalOverDue: 0 });

  const presentDays = attendance.filter((r) => r.status === 'PRESENT').length;
  const lateDays = attendance.filter((r) => r.status === 'LATE').length;
  const absentDays = attendance.filter((r) => r.status === 'ABSENT').length;

  const yearStart = academicYear?.startDate;
  const today = toISTDate(new Date());
  const totalDays = yearStart
    ? countWorkingDays(yearStart, today, weekendDays, holidays)
    : attendance.length;
  const percentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

  return {
    academicYear: {
      id: academicYear?.id ?? '',
      name: academicYear?.name ?? '',
      startDate: academicYear?.startDate,
      endDate: academicYear?.endDate
    },
    organization: {
      id: organization?.id ?? '',
      name: organization?.name ?? '',
      email: organization?.contactEmail ?? undefined,
      phone: organization?.contactPhone ?? undefined,
      logo: organization?.logo ?? undefined,
      website: organization?.website ?? undefined,
      organizationType: organization?.organizationType
    },
    student: {
      id: student?.id ?? '',
      createdAt: student?.createdAt,
      userId: student?.userId ?? '',
      firstName: student?.firstName ?? '',
      middleName: student?.middleName ?? undefined,
      lastName: student?.lastName ?? '',
      fullName: student?.fullName ?? undefined,
      rollNumber: student?.rollNumber ?? '',
      email: student?.email ?? '',
      phoneNumber: student?.phoneNumber ?? '',
      profileImage: student?.profileImage ?? undefined,
      dateOfBirth: student?.dateOfBirth,
      address: student?.address,
      gender: student?.gender,
      admissionDate: student?.createdAt,
      grade: student?.grade,
      section: student?.section,
      parents: student?.parents,
    },
    fees,
    feeSummary,
    attendance,
    attendanceSummary: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      percentage
    },
    examResults,
    leaves,
    reportGeneratedAt: new Date().toISOString(),
    reportGeneratedBy: undefined,
  } as const;
}

// Helper function to get all academic years for dropdown
export const getAcademicYears = async () => {
  const organizationId = await getOrganizationId();

  return await prisma.academicYear.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      isCurrent: true,
      startDate: true,
      endDate: true
    },
    orderBy: { startDate: 'desc' }
  });
}

// Export types for use in components
export type StudentReportData = Awaited<ReturnType<typeof getStudentReport>>;
export type AcademicYearsList = Awaited<ReturnType<typeof getAcademicYears>>;
