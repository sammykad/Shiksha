import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IndianRupee, Wallet, Receipt, CalendarCheck, Users } from 'lucide-react';
import { formatCurrencyIN } from '@/lib/utils';
import { getParentFeesStats } from '@/lib/data/fee/get-parent-fees-stats';

async function ParentFeeStatsContent() {
  const [selectedChildData, familyStats] = await getParentFeesStats();

  const totalFeesAllChildren = familyStats.familyTotalFees;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {/* 1st Card: Family Total Fees (All Children) */}
      <Card className="relative overflow-hidden border-none shadow-md bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col">
              {/* <span className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider">Family</span> */}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Fees (All)</span>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <span className="text-2xl max-sm:text-lg font-bold tabular-nums">
            {formatCurrencyIN(totalFeesAllChildren)}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {familyStats.totalChildren} {familyStats.totalChildren === 1 ? 'child' : 'children'} enrolled
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* 2nd Card: Paid Amount (Selected Child) */}
      <Card className="relative overflow-hidden border-none shadow-md bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col">
              {/* <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                {selectedChildData.student?.firstName + ' ' + selectedChildData.student?.lastName || 'Child'}
              </span> */}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Paid Amount</span>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
              <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl max-sm:text-lg font-bold tabular-nums">
            {formatCurrencyIN(selectedChildData.feeSummary.paid)}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total amount paid
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* 3rd Card: Pending Amount (Selected Child) */}
      <Card className="relative overflow-hidden border-none shadow-md bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col">
              {/* <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
                {selectedChildData.student?.firstName + ' ' + selectedChildData.student?.lastName || 'Child'}
           </span> */}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Amount</span>
            </div>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
              <Wallet className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <span className="text-2xl max-sm:text-lg font-bold tabular-nums">
            {formatCurrencyIN(selectedChildData.feeSummary.pending)}
          </span>
          <p className="text-xs font-medium mt-1 text-rose-600 dark:text-rose-400">
            {selectedChildData.feeSummary.pending > 0 ? 'Payment due' : 'No dues'}
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>

      {/* 4th Card: Attendance (Selected Child) */}
      <Card className="relative overflow-hidden border-none shadow-md bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col">
              {/* <span className="text-xs font-semibold text-amber-400 dark:text-amber-400 uppercase tracking-wider">
                {selectedChildData.student?.firstName + ' ' + selectedChildData.student?.lastName || 'Child'}
              </span> */}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Attendance</span>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <CalendarCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <span className="text-2xl max-sm:text-lg font-bold tabular-nums">
            {selectedChildData.attendanceSummary.percentPresent}%
          </span>
          <Progress value={selectedChildData.attendanceSummary.percentPresent} className="h-1.5 mt-3 bg-slate-100 dark:bg-slate-800" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Average for this month
          </p>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent pointer-events-none" />
        </CardContent>
      </Card>
    </div >
  );
}

function ParentStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ParentFeesStats() {
  return (
    <Suspense fallback={<ParentStatsCardsSkeleton />}>
      <ParentFeeStatsContent />
    </Suspense>
  );
}