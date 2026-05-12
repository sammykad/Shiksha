import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  IndianRupeeIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrencyIN } from '@/lib/utils';
import { getAdminFeesSummary } from '@/lib/data/fee/get-admin-fee-stats';

const AdminFeesSummaryCardsContent = async () => {
  const {
    collectedFees,
    overdueFees,
    paidStudents,
    pendingFees,
    totalFees,
    totalStudents,
    unpaidStudents,
  } = await getAdminFeesSummary();

  const collectedPercentage =
    totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;
  const overduePercentage =
    totalFees > 0 ? Math.round((overdueFees / totalFees) * 100) : 0;
  const paidStudentPercentage =
    totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">

      {/* Total Collection */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Collection</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-950/50">
              <IndianRupeeIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-sm text-muted-foreground">₹</span>
            <span className="text-[22px] font-semibold tabular-nums">
              {formatCurrencyIN(collectedFees)}
            </span>
          </div>
          <Progress value={collectedPercentage} className="h-1.5 mt-2.5" />
          <p className="text-[11px] text-muted-foreground mt-2.5">
            {collectedPercentage}% of {formatCurrencyIN(totalFees)} total
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Pending Collection */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Pending</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-950/50">
              <IndianRupeeIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-sm text-muted-foreground">₹</span>
            <span className="text-[22px] font-semibold tabular-nums">
              {formatCurrencyIN(pendingFees)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2.5">
            {unpaidStudents} students with pending fees
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Overdue Amount */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Overdue</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-950/50">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-sm text-muted-foreground">₹</span>
            <span className="text-[22px] font-semibold tabular-nums">
              {formatCurrencyIN(overdueFees)}
            </span>
          </div>
          {overdueFees > 0 ? (
            <>
              <Progress
                value={overduePercentage}
                className="h-1.5 mt-2.5 [&>div]:bg-red-500"
              />
              <p className="text-[11px] text-red-500 mt-2.5">
                Requires immediate attention
              </p>
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-2.5">
              No overdue fees
            </p>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* Students Paid in Full */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Paid in Full</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-[22px] font-semibold tabular-nums">
              {paidStudents}
            </span>
            <span className="text-sm text-muted-foreground">
              / {totalStudents}
            </span>
          </div>
          <Progress value={paidStudentPercentage} className="h-1.5 mt-2.5 [&>div]:bg-emerald-500" />
          <p className="text-[11px] text-muted-foreground mt-2.5">
            {paidStudentPercentage}% students paid
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

    </div>
  );
};

function AdminFeesSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3.5 bg-muted rounded w-16" />
              <div className="w-7 h-7 bg-muted rounded-lg" />
            </div>
            <div className="h-6 bg-muted rounded w-20 mb-2.5" />
            <div className="h-[3px] bg-muted rounded mb-1.5" />
            <div className="h-3 bg-muted rounded w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminFeesSummaryCards() {
  return (
    <Suspense fallback={<AdminFeesSummaryCardsSkeleton />}>
      <AdminFeesSummaryCardsContent />
    </Suspense>
  );
}