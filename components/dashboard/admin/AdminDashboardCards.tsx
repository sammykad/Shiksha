import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  GraduationCap,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import {
  getStudentStats,
  getTeacherStats,
  getRevenueStats,
  getIssuesStats,
} from '@/lib/data/dashboard/admin-dashboard-cards';
import { getActiveAcademicYear } from '@/lib/academicYear';


// Student Stats Component
async function StudentStatsContent() {
  const stats = await getStudentStats();

  return (
    <CardContent className="p-3">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">Total Students</span>
        <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
        {stats.totalStudents.toLocaleString()}
      </div>

      <Progress value={stats.attendancePercentage} className="h-1.5 mt-3" />

      <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
        <p className="text-[11px] text-muted-foreground leading-none min-w-0 flex-1">
          <span className="font-medium text-foreground">{stats.presentToday}</span> present
          {stats.lateToday > 0 && (
            <>
              <span className="mx-1">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">{stats.lateToday}</span> late
            </>
          )}
          <span className="ml-1 opacity-70">({stats.attendancePercentage}%)</span>
        </p>
        {stats.newAdmissionsThisMonth > 0 && (
          <Badge
            variant="outline"
            className="bg-emerald-50/50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] px-1.5 py-0 h-5 font-medium gap-1 flex-shrink-0"
          >
            <TrendingUp className="w-2.5 h-2.5" />+{stats.newAdmissionsThisMonth}
          </Badge>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
    </CardContent>
  );
}

// Teacher Stats Component
async function TeacherStatsContent() {
  const stats = await getTeacherStats();

  const activePercentage =
    stats.totalTeachers > 0
      ? Math.round((stats.activeTeachers / stats.totalTeachers) * 100)
      : 0;

  return (
    <CardContent className="p-3">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">Teaching Staff</span>
        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
          <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
        {stats.totalTeachers}
      </div>

      <Progress value={activePercentage} className="h-1.5 mt-3" />

      <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
        <p className="text-[11px] text-muted-foreground leading-none min-w-0 flex-1">
          <span className="font-medium text-foreground">{stats.activeTeachers}</span> active
          <span className="ml-1 opacity-70">({activePercentage}%)</span>
        </p>
        {stats.newTeachersThisMonth > 0 && (
          <Badge
            variant="outline"
            className="bg-emerald-50/50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] px-1.5 py-0 h-5 font-medium gap-1 flex-shrink-0"
          >
            <TrendingUp className="w-2.5 h-2.5" />+{stats.newTeachersThisMonth}
          </Badge>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
    </CardContent>
  );
}

// Revenue Stats Component
async function RevenueStatsContent() {
  const [stats, activeYear] = await Promise.all([
    getRevenueStats(),
    getActiveAcademicYear(),
  ]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <CardContent className="p-3">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Revenue {activeYear && `(${activeYear.name})`}
        </span>
        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
          <IndianRupee className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
        {formatCurrency(stats.collectedRevenue)}
      </div>

      <Progress value={stats.revenuePercentage} className="h-1.5 mt-3" />

      <div className="flex items-start justify-between mt-3">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground leading-none">
            <span className="font-medium text-foreground">{formatCurrency(Math.max(0, stats.pendingRevenue))}</span> pending
          </p>
          {stats.overdueFeesCount > 0 && (
            <p className="text-[10px] text-red-600 dark:text-red-400 font-medium leading-none">
              {stats.overdueFeesCount} overdue
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className="bg-emerald-50/50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px] px-1.5 py-0 h-5 font-medium whitespace-nowrap"
        >
          {stats.revenuePercentage}% collected
        </Badge>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
    </CardContent>
  );
}

// Issues Stats Component
async function IssuesStatsContent() {
  const stats = await getIssuesStats();
  const resolutionRate =
    stats.totalIssues > 0
      ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100)
      : 0;

  return (
    <CardContent className="p-3">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">Complaints</span>
        <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
        {stats.pendingIssues}
      </div>

      <p className="text-xs text-muted-foreground mt-1">
        Issues awaiting resolution
      </p>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          <span>
            <span className="font-medium text-foreground">{stats.resolvedIssues}</span> resolved
            <span className="ml-1 opacity-70">({resolutionRate}%)</span>
          </span>
        </div>
        {stats.criticalIssues > 0 && (
          <Badge
            variant="outline"
            className="bg-red-50/50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 text-[10px] px-1.5 py-0 h-5 font-medium"
          >
            {stats.criticalIssues} critical
          </Badge>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
    </CardContent>
  );
}

// Main Component
const AdminDashboardCards = () => {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden">
        <Suspense fallback={<CardStatsSkeleton />}>
          <StudentStatsContent />
        </Suspense>
      </Card>

      <Card className="relative overflow-hidden">
        <Suspense fallback={<CardStatsSkeleton />}>
          <TeacherStatsContent />
        </Suspense>
      </Card>

      <Card className="relative overflow-hidden">
        <Suspense fallback={<CardStatsSkeleton />}>
          <RevenueStatsContent />
        </Suspense>
      </Card>

      <Card className="relative overflow-hidden">
        <Suspense fallback={<CardStatsSkeleton />}>
          <IssuesStatsContent />
        </Suspense>
      </Card>
    </div>
  );
};

export default AdminDashboardCards;

function CardStatsSkeleton() {
  return (
    <CardContent className="p-3">
      <div className="flex items-center justify-between pb-2">
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="h-8 bg-muted rounded w-16 animate-pulse" />
      <div className="h-1.5 bg-muted rounded mt-3 animate-pulse" />
      <div className="h-3 bg-muted rounded w-32 mt-2 animate-pulse" />
    </CardContent>
  );
}