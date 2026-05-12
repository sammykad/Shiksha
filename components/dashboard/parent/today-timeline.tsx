'use client';

import { cn } from '@/lib/utils';
import {
    BookOpen,
    Bell,
    IndianRupee,
    Bus,
    Fingerprint,
    Clock,
    Sparkles,
    CalendarCheck,
    GraduationCap,
} from 'lucide-react';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type TimelineEventStatus = 'completed' | 'active' | 'upcoming' | 'alert';

type TimelineEventCategory =
    | 'session'      // class, lecture, module — works for K12, college, coaching
    | 'exam'         // test, assessment, quiz
    | 'attendance'   // entry, exit, biometric
    | 'fee'          // payment due, reminder
    | 'notice'       // announcement
    | 'transport'    // bus, pickup, drop
    | 'event';       // assembly, seminar, workshop

export interface TimelineEvent {
    id: string;
    time: string;                  // "HH:mm" 24hr
    label: string;                 // "Mathematics", "Fee Due", "Bus Departure"
    sublabel?: string;             // "Room 204", "₹34,334 pending", "Route 3"
    category: TimelineEventCategory;
    status: TimelineEventStatus;
    badge?: string;                // "OVERDUE", "IN 3 DAYS", "LIVE"
    badgeVariant?: 'default' | 'destructive' | 'warning' | 'success' | 'live';
    // Future feature flags — present in type, hidden in UI until feature ships
    featureFlag?: 'transport' | 'biometric' | 'lms' | 'timetable';
}

// ─────────────────────────────────────────────
// Icon + color map — institution-agnostic
// ─────────────────────────────────────────────

const CATEGORY_CONFIG: Record<TimelineEventCategory, {
    Icon: React.ElementType;
    bg: string;
    color: string;
    darkBg: string;
}> = {
    session: {
        Icon: BookOpen,
        bg: 'bg-blue-100',
        darkBg: 'dark:bg-blue-950/50',
        color: 'text-blue-600 dark:text-blue-400',
    },
    exam: {
        Icon: GraduationCap,
        bg: 'bg-purple-100',
        darkBg: 'dark:bg-purple-950/50',
        color: 'text-purple-600 dark:text-purple-400',
    },
    attendance: {
        Icon: Fingerprint,
        bg: 'bg-emerald-100',
        darkBg: 'dark:bg-emerald-950/50',
        color: 'text-emerald-600 dark:text-emerald-400',
    },
    fee: {
        Icon: IndianRupee,
        bg: 'bg-rose-100',
        darkBg: 'dark:bg-rose-950/50',
        color: 'text-rose-600 dark:text-rose-400',
    },
    notice: {
        Icon: Bell,
        bg: 'bg-amber-100',
        darkBg: 'dark:bg-amber-950/50',
        color: 'text-amber-600 dark:text-amber-400',
    },
    transport: {
        Icon: Bus,
        bg: 'bg-cyan-100',
        darkBg: 'dark:bg-cyan-950/50',
        color: 'text-cyan-600 dark:text-cyan-400',
    },
    event: {
        Icon: CalendarCheck,
        bg: 'bg-indigo-100',
        darkBg: 'dark:bg-indigo-950/50',
        color: 'text-indigo-600 dark:text-indigo-400',
    },
};

const BADGE_STYLES: Record<NonNullable<TimelineEvent['badgeVariant']>, string> = {
    default: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
    destructive: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    warning: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
    live: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900 animate-pulse',
};

// ─────────────────────────────────────────────
// Static data builder
// Replace each section with real data as features ship:
//
// session/exam   → timetable feature
// attendance     → biometric feature
// transport      → transport feature
// fee            → already live (getParentFeesData)
// notice         → already live (notices from dashboard data)
// ─────────────────────────────────────────────

export function buildTodayTimeline(
    overrides?: Partial<{
        upcomingExams: { id: string; title: string; startDate: Date; subject: string }[];
        pendingFees: { id: string; category: string; status: string }[];
        notices: { id: string; title: string }[];
    }>
): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const now = new Date();

    // ── Static entries (replace with real data as features ship) ──

    // Transport — static until transport feature ships
    events.push({
        id: 'transport-morning',
        time: '07:15',
        label: 'Morning Pickup',
        sublabel: 'Bus Route · Arriving at stop',
        category: 'transport',
        status: isAfter(now, todayAt(7, 15)) ? 'completed' : 'upcoming',
        featureFlag: 'transport', // hidden badge: "Live tracking coming soon"
    });

    // Attendance check-in — static until biometric ships
    events.push({
        id: 'attendance-in',
        time: '08:00',
        label: 'Session Begins',
        sublabel: 'Attendance marked at entry',
        category: 'attendance',
        status: isAfter(now, todayAt(8, 0)) ? 'completed' : 'upcoming',
        featureFlag: 'biometric',
    });

    // ── Live entries — from real data ──

    // Upcoming exams (already fetched in dashboard)
    (overrides?.upcomingExams ?? []).forEach((exam) => {
        const examDate = new Date(exam.startDate);
        const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / 86400000);
        events.push({
            id: `exam-${exam.id}`,
            time: format(examDate, 'HH:mm'),
            label: exam.title,
            sublabel: exam.subject,
            category: 'exam',
            status: daysUntil <= 0 ? 'active' : 'upcoming',
            badge: daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `IN ${daysUntil}D`,
            badgeVariant: daysUntil <= 1 ? 'destructive' : 'warning',
        });
    });

    // Pending fees (already fetched)
    (overrides?.pendingFees ?? []).slice(0, 2).forEach((fee) => {
        events.push({
            id: `fee-${fee.id}`,
            time: '09:00',
            label: fee.category,
            sublabel: 'Fee payment pending',
            category: 'fee',
            status: 'alert',
            badge: fee.status === 'OVERDUE' ? 'OVERDUE' : 'DUE',
            badgeVariant: fee.status === 'OVERDUE' ? 'destructive' : 'warning',
        });
    });

    // Notices
    (overrides?.notices ?? []).slice(0, 2).forEach((notice) => {
        events.push({
            id: `notice-${notice.id}`,
            time: '10:00',
            label: notice.title,
            category: 'notice',
            status: 'upcoming',
        });
    });

    // Static end-of-day
    events.push({
        id: 'transport-evening',
        time: '23:30',
        label: 'Session Ends',
        sublabel: 'Dismissal · Return pickup',
        category: 'transport',
        status: isAfter(now, todayAt(15, 30)) ? 'completed' : 'upcoming',
        featureFlag: 'transport',
    });

    // Sort by time
    return events.sort((a, b) => a.time.localeCompare(b.time));
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function todayAt(hours: number, minutes: number): Date {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
}

function resolveStatus(event: TimelineEvent, now: Date): TimelineEventStatus {
    if (event.status === 'alert') return 'alert';
    const [h, m] = event.time.split(':').map(Number);
    const eventTime = todayAt(h, m);
    const activeWindow = addMinutes(eventTime, 30);
    if (isAfter(now, activeWindow)) return 'completed';
    if (isAfter(now, eventTime) && isBefore(now, activeWindow)) return 'active';
    return 'upcoming';
}

// ─────────────────────────────────────────────
// Single timeline row
// ─────────────────────────────────────────────

function TimelineRow({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
    const now = new Date();
    const status = resolveStatus(event, now);
    const config = CATEGORY_CONFIG[event.category];
    const Icon = config.Icon;

    return (
        <div className="flex gap-3 group">
            {/* Time column */}
            <div className="flex flex-col items-center w-12 shrink-0">
                <span className={cn(
                    'text-[11px] font-semibold tabular-nums leading-none pt-0.5',
                    status === 'completed' ? 'text-slate-300 dark:text-slate-600' :
                        status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                            status === 'alert' ? 'text-rose-500 dark:text-rose-400' :
                                'text-slate-500 dark:text-slate-400'
                )}>
                    {event.time}
                </span>
            </div>

            {/* Spine */}
            <div className="flex flex-col items-center gap-0 shrink-0">
                {/* Icon dot */}
                <div className={cn(
                    'relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all',
                    status === 'completed'
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : status === 'active'
                            ? 'bg-blue-100 dark:bg-blue-950/60 ring-2 ring-blue-400/40'
                            : status === 'alert'
                                ? 'bg-rose-100 dark:bg-rose-950/50'
                                : cn(config.bg, config.darkBg),
                )}>
                    {status === 'active' && (
                        <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
                    )}
                    <Icon className={cn(
                        'w-3.5 h-3.5',
                        status === 'completed' ? 'text-slate-300 dark:text-slate-600' :
                            status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                                status === 'alert' ? 'text-rose-500 dark:text-rose-400' :
                                    config.color
                    )} />
                </div>

                {/* Connecting line */}
                {!isLast && (
                    <div className={cn(
                        'w-px flex-1 min-h-[20px] mt-1',
                        status === 'completed'
                            ? 'bg-slate-200 dark:bg-slate-700'
                            : 'bg-slate-100 dark:bg-slate-800'
                    )} />
                )}
            </div>

            {/* Content */}
            <div className={cn(
                'flex-1 min-w-0 pb-4 flex items-start justify-between gap-2',
                isLast && 'pb-0'
            )}>
                <div className="min-w-0">
                    <p className={cn(
                        'text-sm font-medium leading-tight truncate',
                        status === 'completed' ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-300' :
                            status === 'active' ? 'text-blue-700 dark:text-blue-300' :
                                status === 'alert' ? 'text-rose-700 dark:text-rose-300' :
                                    'text-slate-700 dark:text-slate-300'
                    )}>
                        {event.label}
                    </p>
                    {event.sublabel && (
                        <p className={cn(
                            'text-xs mt-0.5 truncate',
                            status === 'completed' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'
                        )}>
                            {event.sublabel}
                        </p>
                    )}
                    {/* Future feature coming-soon hint */}
                    {event.featureFlag && status !== 'completed' && (
                        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Live tracking coming soon
                        </p>
                    )}
                </div>

                {event.badge && (
                    <Badge variant="outline" className={cn(
                        'text-[10px] h-5 px-1.5 shrink-0 font-semibold',
                        BADGE_STYLES[event.badgeVariant ?? 'default']
                    )}>
                        {event.badge}
                    </Badge>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Now indicator — visual "you are here"
// ─────────────────────────────────────────────

function NowIndicator() {
    return (
        <div className="flex gap-3 items-center my-1">
            <div className="w-12 shrink-0">
                <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 tabular-nums">
                    {format(new Date(), 'HH:mm')}
                </span>
            </div>
            <div className="flex items-center gap-2 flex-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ring-2 ring-blue-500/30" />
                <div className="h-px flex-1 bg-blue-200 dark:bg-blue-800/60" />
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider shrink-0">Now</span>
                <div className="h-px w-4 bg-blue-200 dark:bg-blue-800/60" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

interface TodayTimelineProps {
    events?: TimelineEvent[];
    // Pass live data from dashboard — optional, falls back to static
    upcomingExams?: { id: string; title: string; startDate: Date; subject: string }[];
    pendingFees?: { id: string; category: string; status: string }[];
    notices?: { id: string; title: string }[];
    className?: string;
}

export function TodayTimeline({
    events,
    upcomingExams,
    pendingFees,
    notices,
    className,
}: TodayTimelineProps) {
    const now = new Date();

    const timelineEvents = events ?? buildTodayTimeline({
        upcomingExams,
        pendingFees,
        notices,
    });

    // Split around current time for "Now" indicator placement
    const pastEvents = timelineEvents.filter((e) => {
        const [h, m] = e.time.split(':').map(Number);
        return isBefore(todayAt(h, m), now) && e.status !== 'alert';
    });

    const futureEvents = timelineEvents.filter((e) => {
        const [h, m] = e.time.split(':').map(Number);
        return !isBefore(todayAt(h, m), now) || e.status === 'alert';
    });

    const allSorted = [...pastEvents, ...futureEvents];
    const nowIndex = pastEvents.length;

    return (
        <div className={cn(
            'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Today&apos;s Timeline</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{format(now, 'EEEE, d MMMM yyyy')}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-lg px-2.5 py-1.5">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                        {format(now, 'hh:mm a')}
                    </span>
                </div>
            </div>

            {/* Timeline body */}
            <div className="px-4 py-4">
                {allSorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                        <CalendarCheck className="w-7 h-7" />
                        <p className="text-xs">Nothing scheduled for today</p>
                    </div>
                ) : (
                    <>
                        {allSorted.map((event, index) => (
                            <div key={event.id}>
                                {/* Insert "Now" indicator between past and future */}
                                {index === nowIndex && nowIndex > 0 && nowIndex < allSorted.length && (
                                    <NowIndicator />
                                )}
                                <TimelineRow
                                    event={event}
                                    isLast={index === allSorted.length - 1}
                                />
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Live bus tracking, biometrics & timetable coming soon
                </p>
            </div>
        </div>
    );
}