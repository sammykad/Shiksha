'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { StudentAttendance } from '@/types/attendance-export';

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Present',
    Icon: CheckCircle2,
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  ABSENT: {
    label: 'Absent',
    Icon: XCircle,
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  LATE: {
    label: 'Late',
    Icon: Clock,
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
} as const;

// ─────────────────────────────────────────────
// AttendanceRow — single record
// ─────────────────────────────────────────────

function AttendanceRow({ record }: { record: StudentAttendance }) {
  const config = STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG];
  if (!config) return null;
  const Icon = config.Icon;

  return (
    <div className={cn(
      'group flex gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0',
      'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-default',
    )}>
      {/* Status dot */}
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className={cn('w-1.5 h-1.5 rounded-full mt-1', config.dot)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* Day + date */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
              {format(new Date(record.date), 'EEEE')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {format(new Date(record.date), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Status badge */}
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap',
            config.badge
          )}>
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        </div>

        {/* Note */}
        {record.note && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 italic">
            {record.note}
          </p>
        )}

        {/* Time ago */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {formatDistanceToNow(new Date(record.date), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RecentAttendanceTimelineWidget
// ─────────────────────────────────────────────

interface RecentAttendanceTimelineWidgetProps {
  recentAttendance?: StudentAttendance[];
  maxHeight?: number;
  className?: string;
}

export function RecentAttendanceTimelineWidget({
  recentAttendance = [],
  maxHeight = 380,
  className,
}: RecentAttendanceTimelineWidgetProps) {

  // ── Summary counts for footer ──
  const presentCount = recentAttendance.filter(r => r.status === 'PRESENT').length;
  const absentCount = recentAttendance.filter(r => r.status === 'ABSENT').length;
  const lateCount = recentAttendance.filter(r => r.status === 'LATE').length;

  return (
    <div className={cn(
      'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col min-h-0',
      className
    )}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
              Attendance History
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Last {recentAttendance.length} school days
            </p>
          </div>
        </div>

        {/* Present rate pill */}
        {recentAttendance.length > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 tabular-nums">
            {Math.round((presentCount + lateCount) / recentAttendance.length * 100)}% rate
          </span>
        )}
      </div>

      {/* ── Scrollable list ── */}
      <ScrollArea className="flex-1 min-h-0" style={{ maxHeight }}>
        {recentAttendance.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <Calendar className="w-7 h-7 opacity-40" />
            <p className="text-xs">No attendance records yet</p>
          </div>
        ) : (
          recentAttendance.map((record) => (
            <AttendanceRow key={record.id} record={record} />
          ))
        )}
      </ScrollArea>

      {/* ── Footer — summary counts ── */}
      {recentAttendance.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {presentCount} Present
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {lateCount} Late
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {absentCount} Absent
          </div>
        </div>
      )}

    </div>
  );
}