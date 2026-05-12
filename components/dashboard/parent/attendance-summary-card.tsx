import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getAttendanceSummaryForChild } from '@/lib/data/parent/parent-dashboard';
import { getSelectedChildId } from '@/lib/data/parent/selected-child';
import Link from 'next/link';

async function AttendanceSummaryContent() {
  const selectedChildId = await getSelectedChildId();
  if (!selectedChildId) return null;

  const data = await getAttendanceSummaryForChild(selectedChildId);
  const student = data.overallStats;

  return (
    <CardContent className="p-4 pt-2">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{data.student?.firstName} {data.student?.lastName}</h4>
            <Badge
              variant={student.percentage >= 90 ? "PRESENT" : student.percentage >= 75 ? "LATE" : "ABSENT"}
              className="text-xs font-medium"
            >
              {student.percentage}%
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress
              value={student.percentage}
              className={`h-1.5 ${student.percentage >= 90 ? '[&>div]:bg-emerald-500' :
                student.percentage >= 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-rose-500'
                }`}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span>{student.presentDays} present</span>
                </div>
                {student.lateDays > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{student.lateDays} late</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-500" />
                  <span>{student.absentDays} absent</span>
                </div>
              </div>
              <span>Total: {student.totalDays} days</span>
            </div>
          </div>

          <div className="pt-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mb-2">Recent 7 Days</p>
            <div className="flex items-center gap-1">
              {data.recentRecords.slice(-7).map((attendance, index) => (
                <div
                  key={index}
                  className={`h-6 w-6 rounded text-[10px] font-medium flex items-center justify-center border ${
                    attendance.status === 'PRESENT'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30'
                      : attendance.status === 'LATE'
                        ? 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/30'
                        : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/30'
                    }`}
                  title={`${new Date(attendance.date).toLocaleDateString()} - ${attendance.status}`}
                >
                  {attendance.status === 'PRESENT'
                    ? 'P'
                    : attendance.status === 'LATE'
                      ? 'L'
                      : 'A'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  );
}

function AttendanceSummarySkeleton() {
  return (
    <CardContent className="p-4 pt-2 space-y-6">
      <div className="space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-5 bg-muted rounded w-12" />
        </div>
        <div className="h-1.5 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-24" />
      </div>
    </CardContent>
  );
}

export function AttendanceSummaryCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-4 flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-lg font-semibold">Attendance Summary</CardTitle>
        </div>
        <Link href="/dashboard/child-attendance" className="text-xs text-primary hover:underline font-medium">
          View Details
        </Link>
      </CardHeader>
      <Suspense fallback={<AttendanceSummarySkeleton />}>
        <AttendanceSummaryContent />
      </Suspense>
    </Card>
  );
}

