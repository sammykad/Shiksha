/**
 * Shared attendance utility functions
 */

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  percentage: number;
}

/**
 * Calculate attendance statistics from records
 */
export function calcStats<T extends { status: string }>(records: T[]): AttendanceStats {
  const totalDays = records.length;
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
