import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { getStudentDashboardStats } from '@/lib/data/student/get-student-dashboard-stats';
import { formatDateIN, timeUntil } from '@/lib/utils';
import Link from 'next/link';
import { DashboardCardSkeleton } from '@/components/skeletons/DashboardCardSkeleton';
import { Badge } from '@/components/ui/badge';

function StudentDashboardStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}

const StudentDashboardStatsContent = async ({
  studentId,
  data,
}: {
  studentId: string;
  data?: any;
}) => {
  const stats = data || (await getStudentDashboardStats(studentId));
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-2 border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/10 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
            <CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.attendanceRate}%
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              ({stats.attendancePresent}P {stats.attendanceLate > 0 ? `· ${stats.attendanceLate}L` : ''} / {stats.attendanceTotal} total)
            </span>
          </div>
          <Progress value={stats.attendanceRate} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            {stats.attendanceRate >= 90 ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-500" />
                Excellent attendance
              </>
            ) : stats.attendanceRate >= 75 ? (
              <>
                <CheckCircle className="w-3 h-3 text-yellow-500" />
                Good attendance
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-red-500" />
                Low attendance - Action required
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/10 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-t-lg">
          <CardTitle className="text-sm font-medium">Current GPA / Grade</CardTitle>
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
            <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {stats.gpa || 'N/A'}
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800">
              {stats.grade || 'N/A'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Academic Standing</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-3 h-3" />
            {(stats.gpa && stats.gpa > 3.5) ? 'Excellent' : (stats.gpa && stats.gpa > 2.5) ? 'Above Average' : 'Needs Focus'}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/10 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-t-lg">
          <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {stats.upcomingExams && stats.upcomingExams.length > 0 ? (
            <>
              {/* Show count */}
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {stats.upcomingExams.length}
              </div>
              <p className="text-xs text-muted-foreground">
                <Link
                  href={'/dashboard/exams'}
                  className="hover:underline hover:text-blue-500"
                >
                  {stats.upcomingExams[0].subject.name || stats.upcomingExams[0].title}
                </Link>{' '}
                at {formatDateIN(stats.upcomingExams[0].startDate)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <Clock className="w-3 h-3" />
                {timeUntil(stats.upcomingExams[0].startDate)} remaining
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming exams 🎉
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/10 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-t-lg">
          <CardTitle className="text-sm font-medium">
            Pending Assignments
          </CardTitle>
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
            <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {stats.pendingAssignments}
          </div>
          <p className="text-xs text-muted-foreground">Due this week</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-3 h-3" />
            Action required
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function StudentDashboardStatsCards({
  studentId,
  data,
}: {
  studentId: string;
  data?: any;
}) {
  return (
    <Suspense fallback={<StudentDashboardStatsCardsSkeleton />}>
      <StudentDashboardStatsContent studentId={studentId} data={data} />
    </Suspense>
  );
}
