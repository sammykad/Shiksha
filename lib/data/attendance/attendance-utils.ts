import { eachDayOfInterval } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { IST } from '@/lib/utils';

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  percentage: number;
}

export interface HolidayRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Count school days in a date range (excludes weekends and holidays).
 * Uses IST timezone for day-of-week detection.
 */
export function countWorkingDays(
  start: Date,
  end: Date,
  weekendDays: number[],
  holidays: HolidayRange[]
): number {
  const allDays = eachDayOfInterval({ start, end });

  const holidaySet = new Set<number>();
  for (const h of holidays) {
    const days = eachDayOfInterval({ start: h.startDate, end: h.endDate });
    for (const d of days) {
      holidaySet.add(toZonedTime(d, IST).getTime());
    }
  }

  return allDays.filter((day) => {
    const dayInIST = toZonedTime(day, IST);
    if (weekendDays.includes(dayInIST.getDay())) return false;
    if (holidaySet.has(dayInIST.getTime())) return false;
    return true;
  }).length;
}

/**
 * Calculate attendance statistics from records.
 * When `workingDays` is provided, percentage is calculated against
 * expected working days (not records count). `totalDays` reflects
 * the actual working days for the period.
 */
export function calcStats<T extends { status: string }>(
  records: T[],
  workingDays?: number
): AttendanceStats {
  const totalDays = workingDays ?? records.length;
  const presentDays = records.filter((r) => r.status === 'PRESENT').length;
  const lateDays = records.filter((r) => r.status === 'LATE').length;
  const absentDays = records.filter((r) => r.status === 'ABSENT').length;
  const percentage = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;
  return { totalDays, presentDays, lateDays, absentDays, percentage };
}

/**
 * Calculate current attendance streak (consecutive PRESENT/LATE days)
 * Records should be ordered by date descending
 */
export function calcCurrentStreak<T extends { status: string }>(records: T[]): number {
  let streak = 0;
  for (const r of records) {
    if (r.status === 'PRESENT' || r.status === 'LATE') streak++;
    else break;
  }
  return streak;
}
