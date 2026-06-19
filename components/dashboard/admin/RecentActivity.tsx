'use client';
import React, { useState } from 'react';
import { cn, formatCurrencyIN } from '@/lib/utils';
import {
  Users,
  GraduationCap,
  IndianRupee,
  Calendar,
  UserPlus,
  AlertTriangle,
  FileText,
  Clock,
  Bell,
  CreditCard,
  BookOpen,
  UserCheck,
  Activity,
  LucideIcon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useTerminology } from '@/context/terminology';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const iconMap: Record<string, LucideIcon> = {
  payment: CreditCard,
  student: Users,
  teacher: GraduationCap,
  complaint: AlertTriangle,
  notice: Bell,
  document: FileText,
  attendance: UserCheck,
  system: Calendar,
};

export interface ActivityItem {
  id: string;
  type:
  | 'student'
  | 'teacher'
  | 'fee'
  | 'lead'
  | 'attendance'
  | 'notice'
  | 'complaint'
  | 'document'
  | 'payment'
  | 'user'
  | 'system';
  title: string;
  description: string;
  icon?: LucideIcon;
  iconStyle: string;
  time: string;
  badge?: {
    text: string;
    variant: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'orange' | 'pink';
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    amount?: number;
    count?: number;
    status?: string;
    grade?: string;
    section?: string;
    studentName?: string;
    email?: string;
    phone?: string;
  };
}

// ---------------------------------------------------------------------------
// Style maps — use semantic color utilities only; no hardcoded white/zinc pairs
// ---------------------------------------------------------------------------

/**
 * Icon container styles per activity type.
 * Uses Tailwind's named color palette for the icon accent (intentional — these
 * are category semantics, not theme semantics) but opacity-based so they
 * adapt automatically to any background.
 */
const iconStyles: Record<string, string> = {
  student: 'bg-blue-500/10   text-blue-600   dark:text-blue-400',
  teacher: 'bg-green-500/10  text-green-600  dark:text-green-400',
  fee: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  lead: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  attendance: 'bg-orange-500/10 text-orange-600  dark:text-orange-400',
  notice: 'bg-purple-500/10  text-purple-600  dark:text-purple-400',
  complaint: 'bg-red-500/10    text-red-600     dark:text-red-400',
  document: 'bg-indigo-500/10  text-indigo-600  dark:text-indigo-400',
  payment: 'bg-teal-500/10   text-teal-600    dark:text-teal-400',
  user: 'bg-pink-500/10   text-pink-600    dark:text-pink-400',
  system: 'bg-muted         text-muted-foreground',
};

/** Badge styles use shadcn Badge variant where possible, or semantic colours. */
const badgeClasses: Record<string, string> = {
  green: 'bg-green-500/10  text-green-700  dark:text-green-400  border-green-500/20',
  blue: 'bg-blue-500/10   text-blue-700   dark:text-blue-400   border-blue-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  red: 'bg-red-500/10    text-red-700    dark:text-red-400    border-red-500/20',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  pink: 'bg-pink-500/10   text-pink-700   dark:text-pink-400   border-pink-500/20',
};

/** Left-border accent per priority. */
const priorityBorder: Record<string, string> = {
  low: 'border-l-border',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  critical: 'border-l-destructive',
};

// ---------------------------------------------------------------------------
// Filter config
// ---------------------------------------------------------------------------

const filterTypes = [
  { id: 'all', label: 'All', icon: Activity },
  { id: 'student', label: 'Students', icon: Users },
  { id: 'teacher', label: 'Teachers', icon: GraduationCap },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'lead', label: 'Leads', icon: UserPlus },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'complaint', label: 'Complaints', icon: AlertTriangle },
  { id: 'notice', label: 'Notices', icon: Bell },
  { id: 'document', label: 'Documents', icon: FileText },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminRecentActivity({
  activities,
  className,
}: {
  activities: ActivityItem[];
  className?: string;
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredActivities = React.useMemo(() => {
    return (
      selectedFilter === 'all'
        ? activities
        : activities.filter((a) => a.type === selectedFilter)
    ).map((a) => ({
      ...a,
      icon: a.icon ?? iconMap[a.type] ?? Activity,
    }));
  }, [activities, selectedFilter]);

  const todayCount = activities.filter(
    (a) => a.time.includes('minutes') || a.time.includes('hour')
  ).length;
  const criticalCount = activities.filter((a) => a.priority === 'critical').length;

  const term = useTerminology()

  return (
    <Card className={cn("flex flex-col gap-0", className)}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex  gap-4 sm:flex-row sm:items-center sm:justify-between px-6 pt-6 pb-2">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription className="mt-1">
            Monitor all {term.institute} activities in real-time
          </CardDescription>
        </div>

        {/* Summary pills — use card/muted tokens */}
        <div className="flex gap-3 shrink-0">
          <StatPill label="Today" value={todayCount} />
          <StatPill label="Critical" value={criticalCount} valueClass="text-destructive" />
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <div className="relative px-6 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {filterTypes.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.id;
            const count =
              filter.id === 'all'
                ? activities.length
                : activities.filter((a) => a.type === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={cn(
                  // base
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                  'text-sm font-medium whitespace-nowrap transition-colors',
                  'snap-center min-w-max',
                  // active uses primary token; inactive uses muted/border tokens
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{filter.label}</span>
                <span
                  className={cn(
                    'ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-background text-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {/* Fade edge */}
        <div className="pointer-events-none absolute right-6 top-0 h-full w-8 bg-gradient-to-l from-card to-transparent" />
      </div>

      {/* ── Activity list ───────────────────────────────────────────── */}
      <CardContent className="pt-2 flex-1 flex flex-col min-h-0">
        <ScrollArea className="h-[400px] w-full">
          <div className={cn(
            "rounded-xl border border-border overflow-hidden bg-card transition-all duration-300",
            filteredActivities.length === 0 && "min-h-[380px] flex flex-col"
          )}>
            <div className="divide-y divide-border">
              {filteredActivities.map((activity) => {
                const Icon = activity.icon!;
                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'group relative flex items-start gap-3 p-4 sm:p-5',
                      'hover:bg-accent/50 transition-colors duration-200',
                      // 'border-l-2/30',
                      // priorityBorder[activity.priority]
                    )}
                  >
                    {/* Icon bubble */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9',
                        'rounded-lg shrink-0 border border-border/50',
                        'transition-transform duration-200 group-hover:scale-105',
                        iconStyles[activity.iconStyle] ?? iconStyles.system
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {/* Title + badge */}
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-foreground">
                              {activity.title}
                            </span>
                            {activity.badge && (
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded-full',
                                  'text-xs font-medium border',
                                  badgeClasses[activity.badge.variant]
                                )}
                              >
                                {activity.badge.text}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {activity.description}
                          </p>

                          {/* Metadata chips */}
                          {activity.metadata && (
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              {activity.metadata.amount !== undefined && (
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {formatCurrencyIN(activity.metadata.amount)}
                                </span>
                              )}
                              {activity.metadata.count !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {activity.metadata.count}{' '}
                                  {activity.metadata.count === 1 ? 'item' : 'items'}
                                </span>
                              )}
                              {activity.metadata.grade && activity.metadata.section && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  Grade {activity.metadata.grade}-{activity.metadata.section}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Timestamp — hidden on small screens */}
                        <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredActivities.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center" style={{ minHeight: 'max(100%,380px)' }}>
                <EmptyState
                  title={activities.length === 0 ? "No activities yet" : "No matching activities"}
                  description={activities.length === 0
                    ? "Activities will appear here as you use the system."
                    : "No recent activities match your current filter."}
                  image="/activity-emptystate.svg"
                  compact
                  className="border-none p-6"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Small helper
// ---------------------------------------------------------------------------

function StatPill({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 px-4 py-2 text-center min-w-[64px]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-semibold text-foreground', valueClass)}>{value}</p>
    </div>
  );
}