'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
  Phone, ChevronRight, Award, IndianRupee,
  GraduationCap, CheckCircle2, Clock, Hash,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatCurrencyIN } from '@/lib/utils';
import type { ChildSummary } from '@/lib/data/parent/get-all-children-by-parentId';
import { calcAttendanceRate } from '@/app/dashboard/my-children/page';

function getAttendanceConfig(rate: number) {
  if (rate >= 85) return {
    label: 'On Track',
    color: 'text-teal-700 dark:text-teal-400',
    bar: 'bg-teal-500',
    pill: 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400',
  };
  if (rate >= 75) return {
    label: 'Needs Attention',
    color: 'text-amber-700 dark:text-amber-400',
    bar: 'bg-amber-400',
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  };
  return {
    label: 'Low Attendance',
    color: 'text-orange-700 dark:text-orange-400',
    bar: 'bg-orange-400',
    pill: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  };
}

export function ChildCard({ child }: { child: ChildSummary }) {
  const attendanceRate = calcAttendanceRate(child.attendance);
  const config = getAttendanceConfig(attendanceRate);
  const isExcellent = attendanceRate >= 90;
  const hasPendingFees = child.pendingFees > 0;

  const presentCount = child.attendance.filter((a) => a.status === 'PRESENT').length;
  const lateCount = child.attendance.filter((a) => a.status === 'LATE').length;
  const absentCount = child.attendance.filter((a) => a.status === 'ABSENT').length;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3.5 p-4 pb-3">
        <div className="relative shrink-0">
          <Avatar className="h-12 w-12 ring-1 ring-slate-200 dark:ring-slate-700">
            <AvatarImage src={child.profileImage ?? undefined} />
            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm">
              {child.firstName[0]}{child.lastName[0]}
            </AvatarFallback>
          </Avatar>
          {isExcellent && (
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900">
              <Award className="h-2 w-2 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
            {child.fullName ?? `${child.firstName} ${child.lastName}`}
          </h3>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {child.grade?.grade && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <GraduationCap className="h-3 w-3" />
                {child.grade.grade}
              </span>
            )}
            {child.section?.name && (
              <>
                <span className="text-slate-300 dark:text-slate-600 text-[11px]">·</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sec {child.section.name}
                </span>
              </>
            )}
            {child.rollNumber && (
              <>
                <span className="text-slate-300 dark:text-slate-600 text-[11px]">·</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <Hash className="h-2.5 w-2.5" />{child.rollNumber}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3 pb-3">
        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* Attendance */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Attendance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn('text-[11px] font-semibold tabular-nums', config.color)}>
                {attendanceRate}%
              </span>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', config.pill)}>
                {config.label}
              </span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', config.bar)}
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {presentCount} present {lateCount > 0 && `· ${lateCount} late `}· {absentCount} absent · last 30 days
          </p>
        </div>

        {/* Fee status — neutral, not alarming */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1.5">
            <IndianRupee className="h-3 w-3 text-slate-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {hasPendingFees ? 'Fee Pending' : 'Fees Paid'}
            </span>
          </div>
          {hasPendingFees ? (
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              ₹{formatCurrencyIN(child.pendingFees)} due
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> All clear
            </span>
          )}
        </div>

        {/* DOB — minimal, no icon clutter */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Born {format(new Date(child.dateOfBirth), 'dd MMM yyyy')}
          {child.gender ? ` · ${child.gender.charAt(0).toUpperCase() + child.gender.slice(1).toLowerCase()}` : ''}
        </p>
      </div>

      {/* Actions — pinned to bottom */}
      <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
        {/* Call */}
        <a
          href={`tel:${child.phoneNumber}`}
          className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </a>

        {/* Pay — always occupies slot, greyed out when no dues */}
        {hasPendingFees ? (
          <Link
            href="/dashboard/fees/parent"
            className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <IndianRupee className="h-3.5 w-3.5" />
            Pay
          </Link>
        ) : (
          <span className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-slate-300 dark:text-slate-600 cursor-not-allowed select-none">
            <IndianRupee className="h-3.5 w-3.5" />
            Pay
          </span>
        )}

        {/* View Profile */}
        <Link
          href={`/dashboard/students/${child.id}`}
          className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          Profile
          <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export function ChildCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-28" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20" />
          </div>
        </div>
        <div className="h-px bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16" />
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-40" />
        </div>
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32" />
      </div>
      <div className="h-12 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800" />
    </div>
  );
}