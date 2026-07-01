'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { getOrganizationWeekendDays } from '@/lib/data/organization/get-organization-weekend-days';
import { countWorkingDays } from '@/lib/data/attendance/attendance-utils';
import { toISTDate } from '@/lib/utils';

export const getStudentDashboardStats = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      sectionId: true,
      organizationId: true,
    },
  });

  if (!student) throw new Error('Student not found');

  const academicYearId = await getActiveAcademicYearId()

  // Attendance Rate — using expected working days
  const [attendanceRecords, weekendDays, holidays, academicYear] = await Promise.all([
    prisma.studentAttendance.findMany({
      where: {
        studentId: student.id,
        academicYearId
      },
      select: {
        status: true,
      },
    }),
    getOrganizationWeekendDays(),
    prisma.academicCalendar.findMany({
      where: { organizationId: student.organizationId, academicYearId },
      select: { startDate: true, endDate: true },
    }),
    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { startDate: true },
    }),
  ]);

  const todayIST = toISTDate(new Date());
  const yearStart = academicYear?.startDate;
  const workingDays = yearStart ? countWorkingDays(yearStart, todayIST, weekendDays, holidays) : attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;

  const attendanceRate = workingDays > 0 ? Math.round(((presentCount + lateCount) / workingDays) * 100) : 0;

  // Calculate GPA/Grade from latest ReportCard
  const latestReportCard = await prisma.reportCard.findFirst({
    where: {
      studentId: student.id,
      academicYearId
    },
    orderBy: { createdAt: 'desc' },
    select: {
      cgpa: true,
      overallGrade: true,
      percentage: true,
    },
  });

  const gpa = latestReportCard?.cgpa || 0;
  const grade = latestReportCard?.overallGrade || 'N/A';

  // Upcoming Exams
  const upcomingExams = await prisma.exam.findMany({
    where: {
      sectionId: student.sectionId,
      status: 'UPCOMING',
      startDate: {
        gte: new Date(),
      },
    },
    select: {
      startDate: true,
      title: true,
      subject: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: { startDate: 'asc' },
    take: 5,
  });

  // Pending Assignments (Still mock for now as no model exists)
  const pendingAssignmentsCount = 0;

  return {
    attendanceRate,
    attendancePresent: presentCount,
    attendanceLate: lateCount,
    attendanceTotal: workingDays,
    gpa,
    grade,
    upcomingExams,
    pendingAssignments: pendingAssignmentsCount,
  };
};
