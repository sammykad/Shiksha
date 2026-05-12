import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IndianRupeeIcon, UsersIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTeacherFeeSummary } from '@/lib/data/teacher/get-teacher-fee-summary';
import { formatCurrencyIN } from '@/lib/utils';
import { getCurrentUserByRole } from '@/lib/auth';

const FeeStatsCardForTeacherContent = async () => {
  const currentUser = await getCurrentUserByRole();

  if (currentUser.role !== 'TEACHER') {
    throw new Error('Only TEACHER can access this');
  }

  const teacherId = currentUser.teacherId;
  const stats = await getTeacherFeeSummary(teacherId);

  const totalFees = stats.paidFees + stats.unpaidFees;
  const paidPercentage = totalFees > 0 ? Math.round((stats.paidFees / totalFees) * 100) : 0;
  const overduePercentage = totalFees > 0 ? Math.round((stats.overdueFees / totalFees) * 100) : 0;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Total Students */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Students</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
              <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
            {stats.totalStudents}
          </div>
          <p className="text-xs text-muted-foreground mt-1">In your class</p>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Paid Fees */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Paid Fees</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <IndianRupeeIcon className="h-4 w-4 text-foreground mb-0.5" />
            <span className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {formatCurrencyIN(stats.paidFees)}
            </span>
          </div>
          <Progress value={paidPercentage} className="h-1.5 mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {paidPercentage}% of {formatCurrencyIN(totalFees)} total
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Unpaid Fees */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Unpaid Fees</span>
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
              <IndianRupeeIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <IndianRupeeIcon className="h-4 w-4 text-foreground mb-0.5" />
            <span className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {formatCurrencyIN(stats.unpaidFees)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.studentsWithUnpaidFees} students with unpaid fees
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Overdue Fees */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Overdue Fees</span>
            <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <IndianRupeeIcon className="h-4 w-4 text-foreground mb-0.5" />
            <span className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {formatCurrencyIN(stats.overdueFees)}
            </span>
          </div>
          {stats.overdueFees > 0 ? (
            <>
              <Progress value={overduePercentage} className="h-1.5 mt-3 [&>div]:bg-red-500" />
              <p className="text-xs text-red-500 mt-2">
                {stats.studentsWithOverdueFees} students · past due date
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">No overdue fees</p>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>
    </div>
  );
};

function FeeStatsCardForTeacherSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-7 bg-muted rounded w-24" />
              <div className="h-1.5 bg-muted rounded mt-3" />
              <div className="h-3 bg-muted rounded w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FeeStatsCardForTeacher() {
  return (
    <Suspense fallback={<FeeStatsCardForTeacherSkeleton />}>
      <FeeStatsCardForTeacherContent />
    </Suspense>
  );
}