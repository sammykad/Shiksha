import { BarChart3, CheckCircle, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrencyIN } from '@/lib/utils';
import type { ChildSummary } from '@/lib/data/parent/get-all-children-by-parentId';
import { calcAttendanceRate } from '@/app/dashboard/my-children/page';

interface ChildrenStatsProps {
  childSummaries: ChildSummary[];
}

export function ChildrenStats({ childSummaries }: ChildrenStatsProps) {
  const totalChildren = childSummaries.length;

  const avgAttendance =
    totalChildren > 0
      ? Math.round(
        childSummaries.reduce((acc, c) => acc + calcAttendanceRate(c.attendance), 0) / totalChildren
      )
      : 0;

  const totalPending = childSummaries.reduce((sum, c) => sum + c.pendingFees, 0);

  const presentCount = childSummaries.reduce(
    (sum, c) => sum + c.attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length,
    0
  );
  const totalAttendanceRecords = childSummaries.reduce((sum, c) => sum + c.attendance.length, 0);

  const completionPercentage = totalChildren > 0 ? Math.round((presentCount / Math.max(totalAttendanceRecords, 1)) * 100) : 0;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Children</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{totalChildren}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Enrolled students
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Avg. Attendance</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{avgAttendance}%</div>
          <Progress value={avgAttendance} className="h-1.5 mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Last 30 days
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Attendance Rate</span>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{completionPercentage}%</div>
          <Progress value={completionPercentage} className="h-1.5 mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {presentCount} of {totalAttendanceRecords} records present
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">{totalPending > 0 ? 'Fees Pending' : 'All Clear'}</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">₹{formatCurrencyIN(totalPending)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalPending > 0 ? 'Across all children' : 'No dues'}
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
