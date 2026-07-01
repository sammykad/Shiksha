'use server';

import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSelectedChildId } from '@/lib/data/parent/selected-child';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getOrganizationWeekendDays } from '@/lib/data/organization/get-organization-weekend-days';
import { CalendarEventType } from '@/generated/prisma/enums';
import { toISTDate, getStartOfMonthIST, getStartOfYearIST, isSameDayIST } from '@/lib/utils';
import { calcStats, calcCurrentStreak, countWorkingDays, type AttendanceStats } from './attendance-utils';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type StudentAttendanceRecord = {
  id: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  note: string | null;
  recordedBy: string;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AcademicCalendarEvent = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  type: CalendarEventType;
  reason: string | null;
  isRecurring: boolean;
};

export type ChildAttendanceData = {
  attendanceData: StudentAttendanceRecord[];
  holidayData: AcademicCalendarEvent[];
  recentAttendance: StudentAttendanceRecord[];
  todayStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
  monthlyStats: AttendanceStats;
  annualStats: AttendanceStats;
  overallStats: AttendanceStats;
  currentStreak: number;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string | null;
    profileImage: string | null;
    grade: { grade: string };
    section: { name: string };
  } | null;
};

// ─────────────────────────────────────────────
// Server Action
// ─────────────────────────────────────────────

export async function getChildAttendanceData(): Promise<ChildAttendanceData | null> {
  const { userId, orgId } = await auth();

  const [selectedChildId, academicYearId] = await Promise.all([
    getSelectedChildId(),
    getActiveAcademicYearId(),
  ]);

  if (!selectedChildId || !academicYearId) {
    return null;
  }

  // Ownership guard + data fetch in parallel
  const [parentStudent, calendarEvents, weekendDays, academicYear] = await Promise.all([
    prisma.parentStudent.findFirst({
      where: {
        parent: { userId, organizationId: orgId },
        studentId: selectedChildId,
        student: { organizationId: orgId },
      },
      select: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            profileImage: true,
            sectionId: true,
            grade: { select: { grade: true } },
            section: { select: { name: true } },
            StudentAttendance: {
              where: { academicYearId },
              orderBy: { date: 'desc' },
              select: {
                id: true,
                date: true,
                status: true,
                note: true,
                recordedBy: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    }),

    // Academic calendar — org + active year
    prisma.academicCalendar.findMany({
      where: {
        organizationId: orgId,
        academicYearId,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        type: true,
        reason: true,
        isRecurring: true,
      },
    }),

    getOrganizationWeekendDays(),

    prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { startDate: true },
    }),
  ]);

  if (!parentStudent) {
    return null;
  }

  const { student } = parentStudent;

  // Map to match exactly
  const attendanceData: StudentAttendanceRecord[] = student.StudentAttendance.map((a) => ({
    id: a.id,
    studentId: student.id,
    date: a.date,
    status: a.status as AttendanceStatus,
    note: a.note ?? null,
    recordedBy: a.recordedBy,
    sectionId: student.sectionId,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  const holidayData: AcademicCalendarEvent[] = calendarEvents.map((e) => ({
    id: e.id,
    name: e.name,
    startDate: e.startDate,
    endDate: e.endDate,
    type: e.type as AcademicCalendarEvent['type'],
    reason: e.reason ?? null,
    isRecurring: e.isRecurring,
  }));

  const todayIST = toISTDate();
  const monthStartIST = getStartOfMonthIST();
  const yearStartIST = getStartOfYearIST();

  const todayRecord = attendanceData.find((r) => isSameDayIST(new Date(r.date), todayIST));
  const todayStatus = (todayRecord?.status ?? 'NOT_MARKED') as ChildAttendanceData['todayStatus'];

  const monthlyRecords = attendanceData.filter((r) => new Date(r.date) >= monthStartIST);
  const annualRecords = attendanceData.filter((r) => new Date(r.date) >= yearStartIST);

  const holidays = holidayData.map((h) => ({ startDate: h.startDate, endDate: h.endDate }));

  const monthlyWorkingDays = countWorkingDays(monthStartIST, todayIST, weekendDays, holidays);
  const annualWorkingDays = countWorkingDays(yearStartIST, todayIST, weekendDays, holidays);
  const overallWorkingDays = academicYear
    ? countWorkingDays(academicYear.startDate, todayIST, weekendDays, holidays)
    : undefined;

  return {
    attendanceData,
    holidayData,
    recentAttendance: attendanceData.slice(0, 10),
    todayStatus,
    monthlyStats: calcStats(monthlyRecords, monthlyWorkingDays),
    annualStats: calcStats(annualRecords, annualWorkingDays),
    overallStats: calcStats(attendanceData, overallWorkingDays),
    currentStreak: calcCurrentStreak(attendanceData),
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: student.fullName,
      profileImage: student.profileImage,
      grade: student.grade,
      section: student.section,
    },
  };
}
