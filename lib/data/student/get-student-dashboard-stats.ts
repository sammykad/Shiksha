'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';

export const getStudentDashboardStats = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      sectionId: true,
    },
  });

  if (!student) throw new Error('Student not found');

  const academicYearId = await getActiveAcademicYearId()

  // Attendance Rate (last 30 days)
  const attendanceRecords = await prisma.studentAttendance.findMany({
    where: {
      studentId: student.id,
      academicYearId
    },
    select: {
      status: true,
    },
  });

  const total = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;

  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

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
    attendanceTotal: total,
    gpa,
    grade,
    upcomingExams,
    pendingAssignments: pendingAssignmentsCount,
  };
};
