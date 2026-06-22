import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import { getTeacherDashboardStats } from '@/lib/data/teacher/get-teacher-dashboard-stats';

async function TeacherStatsContent() {
  const stats = await getTeacherDashboardStats();

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">My Students</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {stats.totalStudents}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.todayAttendance.present} present{stats.todayAttendance.late > 0 ? ` · ${stats.todayAttendance.late} late` : ''}
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Attendance Rate</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {stats.todayAttendance.percentage}%
          </div>
          <Progress value={stats.todayAttendance.percentage} className="h-1.5 mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.todayAttendance.present + stats.todayAttendance.late} of {stats.todayAttendance.total} students present
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Teaching Subjects</span>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
              <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {stats.teacher.teachingAssignment.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Subjects you&apos;re assigned
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Pending Complaints</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {stats.pendingComplaints}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingComplaints > 0 ? 'Action Required' : 'All Clear'}
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden animate-pulse">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-8 w-8 bg-muted rounded-lg"></div>
            </div>
            <div className="h-7 bg-muted rounded w-16 mt-1"></div>
            <div className="h-3 bg-muted rounded w-24 mt-3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TeacherStatsCards() {
  return (
    <Suspense fallback={<TeacherStatsCardsSkeleton />}>
      <TeacherStatsContent />
    </Suspense>
  );
}
