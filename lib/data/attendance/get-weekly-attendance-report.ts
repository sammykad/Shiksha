'use server';
import { AttendanceStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/db';
import {
  addDays,
  formatISO,
  startOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
} from 'date-fns';
import { toISTDate } from '@/lib/utils';

export async function getWeeklyAttendanceReport(
  studentId: string,
  weekOffset: number = 0
) {
  // 1. student profile
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { grade: true, section: true, organization: true },
  });
  if (!student) return null;

  // 2. Calculate week range with offset for navigation
  const today = new Date();
  const targetDate = weekOffset === 0 ? today : addWeeks(today, weekOffset);
  const weekStart = toISTDate(startOfWeek(targetDate, { weekStartsOn: 1 }));
  const weekEnd = toISTDate(addDays(weekStart, 6));

  // 3. fetch rows for the week
  const weeklyRows = await prisma.studentAttendance.findMany({
    where: {
      studentId,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: { date: 'asc' },
  });

  // 4. build daily records
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weeklyRecords = weekDays.map((d) => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const record = weeklyRows.find(
      (r) => format(r.date, 'yyyy-MM-dd') === dateStr
    );

    return {
      date: dateStr,
      status: (record?.status ?? 'NOT_MARKED') as
        | AttendanceStatus
        | 'NOT_MARKED',
      note: record?.note ?? null,
    };
  });
  const yearRows = await prisma.studentAttendance.findMany({
    where: {
      studentId,
    },
  });

  const totalPossibleYear = yearRows.length;
  const totalPresentYear = yearRows.filter((r) => r.status === 'PRESENT').length;
  const totalLateYear = yearRows.filter((r) => r.status === 'LATE').length;
  
  const yearPercentage =
    totalPossibleYear > 0
      ? Math.round(((totalPresentYear + totalLateYear) / totalPossibleYear) * 100)
      : 0;

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName,
      rollNumber: student.rollNumber,
      profileImage: student.profileImage,
      grade: { grade: student.grade.grade },
      section: { name: student.section.name },
    },
    attendanceRecords: weeklyRecords,
    weekRange: {
      startDate: formatISO(weekStart, { representation: 'date' }),
      endDate: formatISO(weekEnd, { representation: 'date' }),
    },
    organization: {
      name: student.organization.name,
      logo: student.organization.logo,
      contactEmail: student.organization.contactEmail,
      contactPhone: student.organization.contactPhone,
    },
    cumulativeStats: {
      totalDaysPresent: totalPresentYear,
      totalDaysLate: totalLateYear,
      totalPossibleDays: totalPossibleYear,
      attendancePercentage: yearPercentage,
    },
    weekOffset, // Return current week offset for navigation
  };
}
