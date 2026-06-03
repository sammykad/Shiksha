'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { toISTDate, getStartOfMonthIST, getStartOfYearIST, isSameDayIST } from '@/lib/utils';
import { StudentAttendance, AcademicCalendar } from '@/types/attendance-export';
import { calcStats, calcCurrentStreak, type AttendanceStats } from './attendance-utils';

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
  const [organizationId, academicYearId] = await Promise.all([
    getOrganizationId(),
    getActiveAcademicYearId(),
  ]);

  const student = await prisma.student.findFirst({
    where: { userId, organizationId },
    select: { id: true, firstName: true, lastName: true, rollNumber: true },
  });

  if (!student) throw new Error('Student not found');

  const todayIST = toISTDate();
  const monthStartIST = getStartOfMonthIST();
  const yearStartIST = getStartOfYearIST();

  const [attendanceData, holidayData] = await Promise.all([
    prisma.studentAttendance.findMany({
      where: { studentId: student.id, academicYearId },
      orderBy: { date: 'desc' },
    }),
    prisma.academicCalendar.findMany({
      where: { organizationId, academicYearId },
    }),
  ]);

  const todayRecord = attendanceData.find((r) => isSameDayIST(new Date(r.date), todayIST));
  const todayStatus = (todayRecord?.status ?? 'NOT_MARKED') as MyAttendanceData['todayStatus'];

  const monthlyRecords = attendanceData.filter((r) => new Date(r.date) >= monthStartIST);
  const annualRecords = attendanceData.filter((r) => new Date(r.date) >= yearStartIST);

  return {
    student,
    attendanceData,
    holidayData,
    recentAttendance: attendanceData.slice(0, 10),
    todayStatus,
    monthlyStats: calcStats(monthlyRecords),
    annualStats: calcStats(annualRecords),
    overallStats: calcStats(attendanceData),
    currentStreak: calcCurrentStreak(attendanceData),
  };
}
