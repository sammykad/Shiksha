import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Clock, BarChart3, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getAttendanceCompletionStats } from '@/lib/data/attendance/get-attendance-completion-stats';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SectionWiseAttendanceTable } from '@/components/dashboard/StudentAttendance/section-wise-attendance-table';
import { getDatabaseOrganization, getOrganizationId } from '@/lib/organization';
import { toISTDate } from '@/lib/utils';
import { AnalyticsDateFilter } from '@/components/dashboard/StudentAttendance/analytics-date-filter';
import { SearchParams } from 'nuqs';
import { format } from 'date-fns';

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function AttendanceAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dateParam = params.date as string;
  const selectedDate = dateParam ? toISTDate(new Date(dateParam)) : toISTDate(new Date());

  const organizationId = await getOrganizationId();
  const organization = await getDatabaseOrganization(organizationId);
  const attendanceData = await getAttendanceCompletionStats(selectedDate);

  if (!attendanceData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Unable to fetch attendance data for {format(selectedDate, 'PPP')}.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { sections, stats } = attendanceData;

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6 px-2 pb-4">
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Left */}
            <div className="shrink-0">
              <CardTitle>Attendance Analytics</CardTitle>
              <CardDescription>
                {isToday ? "Today's" : format(selectedDate, "PPP")} attendance overview
              </CardDescription>
            </div>

            {/* Right */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center lg:flex-row gap-2 w-full sm:w-auto">
              <div className="w-full flex items-center justify-center text-center">
                <AnalyticsDateFilter />
              </div>
              <Button size="sm" asChild className="whitespace-nowrap">
                <Link href="/dashboard/attendance/mark">
                  <Users className="w-4 h-4 mr-1.5" />
                  Take Attendance
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-3" >
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Sections</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{stats.totalSections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sections tracking attendance
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{stats.completionPercentage}%</div>
            <Progress value={stats.completionPercentage} className="h-1.5 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.completedSections} of {stats.totalSections} sections reported
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
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{stats.attendancePercentage}%</div>
            <Progress value={stats.attendancePercentage} className="h-1.5 mt-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.totalPresent} of {stats.totalStudents} students present
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Reports</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{stats.pendingSections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sections yet to report
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
          </CardContent>
        </Card>
      </div>

      {/* Section-wise Table */}
      <SectionWiseAttendanceTable
        sections={sections}
        date={selectedDate}
        organization={organization}
      />
    </div>
  );
}
