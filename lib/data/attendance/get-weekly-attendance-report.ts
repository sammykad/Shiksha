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
import { toISTDate, IST } from '@/lib/utils';
import { toZonedTime } from 'date-fns-tz';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getOrganizationWeekendDays } from '@/lib/data/organization/get-organization-weekend-days';
import { countWorkingDays } from './attendance-utils';

export async function getWeeklyAttendanceReport(
  studentId: string,
  weekOffset: number = 0
) {
  // 1. student profile
  const [student, academicYearId] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: { grade: true, section: true, organization: true },
    }),
    getActiveAcademicYearId(),
  ]);
  if (!student) return null;

  // 2. Fetch weekend config, academic year, and holidays in parallel
  const [weekendDays, academicYear, holidays] = await Promise.all([
    getOrganizationWeekendDays(),
    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { startDate: true },
    }),
    prisma.academicCalendar.findMany({
      where: { organizationId: student.organization.id, academicYearId },
      select: { startDate: true, endDate: true },
    }),
  ]);

  // 3. Calculate week range with offset for navigation (IST-aware)
  const today = toISTDate(new Date());
  const targetDate = weekOffset === 0 ? today : addWeeks(today, weekOffset);
  const weekStart = toISTDate(startOfWeek(targetDate, { weekStartsOn: 1 }));
  const weekEnd = toISTDate(addDays(weekStart, 6));

  // 4. fetch rows for the week
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

  // 5. build daily records (exclude weekend days + holidays)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    .filter((d) => {
      if (weekendDays.includes(toZonedTime(d, IST).getDay())) return false;
      const t = d.getTime();
      return !holidays.some((h) => t >= h.startDate.getTime() && t <= h.endDate.getTime());
    });
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

  // 6. Year-to-date cumulative stats (using expected school days)
  const yearStart = academicYear?.startDate ?? weekStart;
  const yearWorkingDays = countWorkingDays(yearStart, today, weekendDays, holidays);

  const yearRows = await prisma.studentAttendance.findMany({
    where: {
      studentId,
      academicYearId,
    },
  });

  const totalPresentYear = yearRows.filter((r) => r.status === 'PRESENT').length;
  const totalLateYear = yearRows.filter((r) => r.status === 'LATE').length;

  const yearPercentage =
    yearWorkingDays > 0
      ? Math.round(((totalPresentYear + totalLateYear) / yearWorkingDays) * 100)
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
      totalPossibleDays: yearWorkingDays,
      attendancePercentage: yearPercentage,
    },
    weekOffset, // Return current week offset for navigation
  };
}
