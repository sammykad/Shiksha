'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { toISTDate, getStartOfMonthIST, getStartOfYearIST, isSameDayIST } from '@/lib/utils';
import { getOrganizationWeekendDays } from '@/lib/data/organization/get-organization-weekend-days';
import { StudentAttendance, AcademicCalendar } from '@/types/attendance-export';
import { calcStats, calcCurrentStreak, countWorkingDays, type AttendanceStats } from './attendance-utils';

export interface MyAttendanceData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
  };
  attendanceData: StudentAttendance[];
  holidayData: AcademicCalendar[];
  recentAttendance: StudentAttendance[];
  todayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
  monthlyStats: AttendanceStats;
  annualStats: AttendanceStats;
  overallStats: AttendanceStats;
  currentStreak: number;
}

export async function getMyAttendance(userId: string): Promise<MyAttendanceData> {
  const [organizationId, academicYearId, weekendDays] = await Promise.all([
    getOrganizationId(),
    getActiveAcademicYearId(),
    getOrganizationWeekendDays(),
  ]);

  const student = await prisma.student.findFirst({
    where: { userId, organizationId },
    select: { id: true, firstName: true, lastName: true, rollNumber: true },
  });

  if (!student) throw new Error('Student not found');

  const todayIST = toISTDate();
  const monthStartIST = getStartOfMonthIST();
  const yearStartIST = getStartOfYearIST();

  const [attendanceData, holidayData, academicYear] = await Promise.all([
    prisma.studentAttendance.findMany({
      where: { studentId: student.id, academicYearId },
      orderBy: { date: 'desc' },
    }),
    prisma.academicCalendar.findMany({
      where: { organizationId, academicYearId },
    }),
    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { startDate: true },
    }),
  ]);

  const todayRecord = attendanceData.find((r) => isSameDayIST(new Date(r.date), todayIST));
  const todayStatus = (todayRecord?.status ?? 'NOT_MARKED') as MyAttendanceData['todayStatus'];

  const monthlyRecords = attendanceData.filter((r) => new Date(r.date) >= monthStartIST);
  const annualRecords = attendanceData.filter((r) => new Date(r.date) >= yearStartIST);

  const holidays = holidayData.map((h) => ({ startDate: h.startDate, endDate: h.endDate }));

  const monthlyWorkingDays = countWorkingDays(monthStartIST, todayIST, weekendDays, holidays);
  const annualWorkingDays = countWorkingDays(yearStartIST, todayIST, weekendDays, holidays);
  const overallWorkingDays = academicYear
    ? countWorkingDays(academicYear.startDate, todayIST, weekendDays, holidays)
    : undefined;

  return {
    student,
    attendanceData,
    holidayData,
    recentAttendance: attendanceData.slice(0, 10),
    todayStatus,
    monthlyStats: calcStats(monthlyRecords, monthlyWorkingDays),
    annualStats: calcStats(annualRecords, annualWorkingDays),
    overallStats: calcStats(attendanceData, overallWorkingDays),
    currentStreak: calcCurrentStreak(attendanceData),
  };
}
