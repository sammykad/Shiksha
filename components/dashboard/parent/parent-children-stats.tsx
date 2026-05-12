'use client';

import { Users, Clock, GraduationCap, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrencyIN } from '@/lib/utils';
import type { ChildSummary } from '@/lib/data/parent/get-all-children-by-parentId';
import { calcAttendanceRate } from '@/app/dashboard/my-children/page';

interface ChildrenStatsProps {
  children: ChildSummary[];
}

export function ChildrenStats({ children }: ChildrenStatsProps) {
  const totalChildren = children.length;

  const avgAttendance =
    totalChildren > 0
      ? Math.round(
        children.reduce((acc, c) => acc + calcAttendanceRate(c.attendance), 0) / totalChildren
      )
      : 0;

  const uniqueGrades = new Set(children.map((c) => c.grade?.grade).filter(Boolean)).size;

  const totalPending = children.reduce((sum, c) => sum + c.pendingFees, 0);

  const stats = [
    {
      label: 'Total Children',
      value: totalChildren,
      sub: 'Enrolled learners',
      Icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      gradient: 'from-blue-500/5',
    },
    {
      label: 'Avg. Attendance',
      value: `${avgAttendance}%`,
      sub: 'Last 30 days',
      Icon: Clock,
      color: avgAttendance >= 85
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-amber-600 dark:text-amber-400',
      bg: avgAttendance >= 85
        ? 'bg-emerald-50 dark:bg-emerald-950/40'
        : 'bg-amber-50 dark:bg-amber-950/40',
      gradient: avgAttendance >= 85 ? 'from-emerald-500/5' : 'from-amber-500/5',
    },
    {
      label: 'Grade Levels',
      value: uniqueGrades,
      sub: 'Academic levels',
      Icon: GraduationCap,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      gradient: 'from-purple-500/5',
    },
    {
      label: 'Fees Pending',
      value: `₹${formatCurrencyIN(totalPending)}`,
      sub: totalPending > 0 ? 'Across all children' : 'All clear ✓',
      Icon: IndianRupee,
      color: totalPending > 0
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-emerald-600 dark:text-emerald-400',
      bg: totalPending > 0
        ? 'bg-rose-50 dark:bg-rose-950/40'
        : 'bg-emerald-50 dark:bg-emerald-950/40',
      gradient: totalPending > 0 ? 'from-rose-500/5' : 'from-emerald-500/5',
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, sub, Icon, color, bg, gradient }) => (
        <Card key={label} className="relative overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
              <div className={cn('p-1.5 rounded-lg', bg)}>
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </div>
            </div>
            <div className={cn('text-2xl font-bold tabular-nums', color)}>{value}</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
            <div className={cn('absolute inset-0 bg-gradient-to-r to-transparent pointer-events-none', gradient)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChildrenStatsSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
              <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}