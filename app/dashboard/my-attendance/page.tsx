import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  AlertCircle,
  Clock,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { AttendanceStatsCards } from '@/components/dashboard/StudentAttendance/attendance-stats-cards';
import { StudentAttendanceCalendar } from '@/components/dashboard/StudentAttendance/attendance-calendar';
import { RecentAttendanceTimelineWidget } from '@/components/dashboard/StudentAttendance/recent-attendance-timeline';
import WeeklyAttendanceReportCard from '@/components/dashboard/StudentAttendance/WeeklyAttendanceReportCard';
import { getWeeklyAttendanceReport } from '@/lib/data/attendance/get-weekly-attendance-report';
import { getMyAttendance } from '@/lib/data/attendance/my-attendance';
import { getCurrentUserByRole } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { getActiveAcademicYear } from '@/lib/academicYear';

export default async function AttendancePage() {
  const user = await getCurrentUserByRole();

  if (!user || user.role !== 'STUDENT') {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Student account not found.
      </div>
    );
  }

  const [attendanceResult, weeklyReportData, activeAcademicYear] = await Promise.all([
    getMyAttendance(user.userId),
    getWeeklyAttendanceReport(user.studentId),
    getActiveAcademicYear(),
  ]);

  if (!attendanceResult) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
        No attendance data available.
      </div>
    );
  }

  const {
    attendanceData,
    holidayData,
    recentAttendance,
    todayStatus,
    monthlyStats,
    annualStats,
    overallStats,
    currentStreak,
  } = attendanceResult;

  const monthlyPct = monthlyStats.percentage;
  const annualPct = annualStats.percentage;

  // Days of attendance (P+L) needed so (attended + n) / (totalDays + n) >= 85% — same numerator as monthly %
  const monthlyAttended = monthlyStats.presentDays + monthlyStats.lateDays;
  const daysToTarget = Math.max(
    0,
    Math.ceil(
      (0.85 * monthlyStats.totalDays - monthlyAttended) / (1 - 0.85),
    ),
  );

  return (
    <div className="px-2 space-y-4">

      <PageHeader title='My Attendance' description='Track your attendance and reports' actions={<>
        {weeklyReportData && <WeeklyAttendanceReportCard data={weeklyReportData} />}
        <Link href="/dashboard" className="max-sm:hidden">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
      </>} />

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <AttendanceStatsCards
        data={{ todayStatus, monthlyStats, annualStats, overallStats }}
      />

      {/* ── Main Grid ────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-12 items-stretch">

        {/* Left — Calendar */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <StudentAttendanceCalendar
            attendanceRecords={attendanceData}
            academicCalendarEvents={holidayData}
            activeAcademicYear={activeAcademicYear}
          />
          {/* <AttendanceSkyline attendanceData={attendanceData} weeks={20} /> */}
        </div>

        {/* Right — Timeline + Goals + Summary */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-w-0 min-h-0">

          {/* Recent Timeline */}
          <RecentAttendanceTimelineWidget
            recentAttendance={recentAttendance}
            maxHeight={320}
          />

          {/* Attendance Goals */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                Attendance Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly target</span>
                  <span className={monthlyPct >= 85 ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                    {monthlyPct}% / 85%
                  </span>
                </div>
                <Progress value={monthlyPct} className="h-1.5" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual target</span>
                  <span className={annualPct >= 90 ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                    {annualPct}% / 90%
                  </span>
                </div>
                <Progress value={annualPct} className="h-1.5" />
              </div>

              {monthlyPct < 85 && (
                <>
                  <Separator />
                  <div className="flex gap-2 text-sm text-orange-700 dark:text-orange-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-orange-500" />
                    <p>
                      Attend the next{' '}
                      <span className="font-semibold">{daysToTarget} consecutive days</span>{' '}
                      to reach your 85% monthly goal.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          {/* <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-1">
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {monthlyPct}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Attendance rate</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-md bg-green-50 dark:bg-green-950/30 p-2">
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    {monthlyStats.presentDays}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">Present</p>
                </div>
                <div className="rounded-md bg-orange-50 dark:bg-orange-950/30 p-2">
                  <p className="font-semibold text-orange-700 dark:text-orange-300">
                    {monthlyStats.lateDays}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Late</p>
                </div>
                <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-2">
                  <p className="font-semibold text-red-700 dark:text-red-300">
                    {monthlyStats.absentDays}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">Absent</p>
                </div>
              </div>

              {currentStreak > 0 && (
                <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {currentStreak}-day streak — keep it up!
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* Smart Recommendations */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {monthlyPct >= 90 ? (
                <div className="rounded-md bg-green-50 dark:bg-green-950/30 p-3">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    🎉 Excellent attendance!
                  </p>
                  <p className="text-green-700 dark:text-green-300 mt-0.5 text-xs">
                    You're doing great — keep this consistency going.
                  </p>
                </div>
              ) : monthlyPct >= 75 ? (
                <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    📈 Good progress
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-0.5 text-xs">
                    Small improvements each week will push you into the top tier.
                  </p>
                </div>
              ) : (
                <div className="rounded-md bg-orange-50 dark:bg-orange-950/30 p-3">
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    ⚠️ Needs improvement
                  </p>
                  <p className="text-orange-700 dark:text-orange-300 mt-0.5 text-xs">
                    Focus on consistent daily attendance to reach your goals.
                  </p>
                </div>
              )}

              <Separator />

              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" /> Set alarms 15 minutes apart
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" /> Prepare your bag the night before
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" /> Track and protect your sleep schedule
                </li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}