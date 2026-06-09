'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import {
    Bell, Pin, AlertTriangle, Info, PartyPopper,
    BookOpen, ChevronRight, Megaphone, Filter,
    Calendar, Clock, FileText, Trophy,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NoticeType, NoticePriority } from '@/generated/prisma/enums';
import { Notice } from '@/generated/prisma/client';

const TYPE_CONFIG: Record<NoticeType, {
    label: string;
    Icon: React.ElementType;
    dot: string;
    badge: string;
}> = {
    GENERAL: {
        label: 'General',
        Icon: Megaphone,
        dot: 'bg-slate-400',
        badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    },
    TRIP: {
        label: 'Trip',
        Icon: Calendar,
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    EVENT: {
        label: 'Event',
        Icon: PartyPopper,
        dot: 'bg-purple-500',
        badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
    },
    EXAM: {
        label: 'Exam',
        Icon: BookOpen,
        dot: 'bg-blue-500',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    },
    HOLIDAY: {
        label: 'Holiday',
        Icon: PartyPopper,
        dot: 'bg-teal-500',
        badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
    },
    DEADLINE: {
        label: 'Deadline',
        Icon: Clock,
        dot: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    },
    TIMETABLE: {
        label: 'Timetable',
        Icon: FileText,
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
    },
    RESULT: {
        label: 'Result',
        Icon: Trophy,
        dot: 'bg-orange-500',
        badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
    },
};

const PRIORITY_CONFIG: Record<NoticePriority, { label: string; className: string }> = {
    LOW: { label: 'Low', className: 'text-slate-400' },
    MEDIUM: { label: '', className: '' }, // don't show medium — it's the default
    HIGH: { label: 'High', className: 'text-amber-500' },
    URGENT: { label: 'Urgent', className: 'text-rose-500 font-semibold' },
};

// ─────────────────────────────────────────────
// Helper: is notice currently active?
// ─────────────────────────────────────────────

function isActive(notice: Notice): boolean {
    const now = new Date();
    return !isAfter(notice.startDate, now) && !isBefore(notice.endDate, now);
}

// ─────────────────────────────────────────────
// NoticeRow
// ─────────────────────────────────────────────

function NoticeRow({ notice }: { notice: Notice }) {
    const config = TYPE_CONFIG[notice.noticeType];
    const priority = PRIORITY_CONFIG[notice.priority];
    const active = isActive(notice);

    return (
        <Link
            href={`/dashboard/notices/${notice.id}`}
            className={cn(
                'group flex gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0',
                'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors',
                notice.isPinned && 'bg-slate-50/80 dark:bg-slate-800/20',
            )}
        >
            {/* Type dot */}
            <div className="flex flex-col items-center pt-1 shrink-0">
                <div className={cn('w-1.5 h-1.5 rounded-full mt-1', config.dot)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {notice.isPinned && (
                            <Pin className="h-3 w-3 text-slate-400 shrink-0 rotate-45" />
                        )}
                        {notice.isUrgent && (
                            <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />
                        )}
                        <p className="text-sm font-medium dark:text-slate-200 leading-snug line-clamp-2">
                            {notice.title}
                        </p>
                    </div>
                    <span className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap',
                        config.badge
                    )}>
                        {config.label}
                    </span>
                </div>

                {/* Summary or content */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {notice.summary ?? notice.content}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDistanceToNow(notice.createdAt, { addSuffix: true })}
                    </p>

                    {/* Active indicator */}
                    {active && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                        </span>
                    )}

                    {/* Priority badge — only for HIGH / URGENT */}
                    {priority.label && (
                        <span className={cn('text-xs', priority.className)}>
                            {priority.label}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─────────────────────────────────────────────
// ListLoadingSVG
// ─────────────────────────────────────────────

function ListLoadingSVG({ className }: { className?: string }) {
    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{
                __html: `<svg fill="none" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="cp-200-100"><rect height="100" width="200" y="0" x="0" /></clipPath><g id="comp_0"><g id="Shape Layer 1"><g transform="translate(48.961,49.211)"><g transform="scale(0,0)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="1.2s" begin="5.066s" calcMode="spline" values="0 0; 0.93 0.93" keyTimes="0; 1" keySplines="0.333 0 0.044 0.991" fill="freeze" /><g transform="translate(66.789,32.789)"><g id="Rectangle 1" transform="matrix(1,0,0,1,-66.789,-32.789)"><rect ry="4" rx="4" height="38.422" width="38.422" y="0" x="0" fill="#e4e6eb" fill-opacity="1" /></g></g></g></g></g><g id="Shape Layer 2"><g transform="translate(81,41.26)"><g transform="scale(0,0.755)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="2s" begin="5.266s" calcMode="spline" values="0 0.755; 0.9 0.755; 0.85 0.755" keyTimes="0; 0.6; 1" keySplines="0.333 0 0.651 0.997; 0.379 0.027 0.524 0.94" fill="freeze" /><g transform="translate(30,6.544)"><g id="Rectangle 1" transform="matrix(1,0,0,1,12.63,-8.364)"><rect ry="2" rx="2" height="14.271" width="85.26" y="0" x="0" fill="#f0f2f5" fill-opacity="1" /></g></g></g></g></g><g id="Shape Layer 3"><animate repeatCount="indefinite" begin="5.066s" calcMode="discrete" fill="freeze" dur="7.866s" values="visible; hidden" keyTimes="0; 1" attributeName="visibility" /><g transform="translate(81,59.26)"><g transform="scale(0,0.755)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="2s" begin="5.666s" calcMode="spline" values="0 0.755; 1.1 0.755; 1 0.755" keyTimes="0; 0.6; 1" keySplines="0.333 0 0.651 0.998; 0.379 0.013 0.524 0.97" fill="freeze" /><g transform="translate(30,6.544)"><g id="Rectangle 1" transform="matrix(1,0,0,1,12.63,-8.364)"><rect ry="2" rx="2" height="14.271" width="85.26" y="0" x="0" fill="#f0f2f5" fill-opacity="1" /></g></g></g></g></g></g></defs><g opacity="0.557" id="Comp 1"><animate repeatCount="indefinite" begin="5.066s" calcMode="discrete" fill="freeze" dur="0.934s" values="visible; hidden" keyTimes="0; 1" attributeName="visibility" /><animate repeatCount="indefinite" attributeName="opacity" dur="3.2s" begin="2.733s" calcMode="spline" values="1; 0.6; 0.6; 0" keyTimes="0; 0.292; 0.708; 1" keySplines="0 0 1 1; 0 0 1 1; 0 0 1 1" fill="freeze" /><g transform="translate(150,121.029)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="3.2s" begin="2.734s" calcMode="spline" values="150 175; 150 123.5; 150 123.5; 150 86.5" keyTimes="0; 0.292; 0.708; 1" keySplines="0.333 0 0.182 1; 0 0 1 1; 0.167 0 0.182 1" fill="freeze" /><g transform="scale(0.79,0.79)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="3.2s" begin="2.734s" calcMode="spline" values="1 1; 0.8 0.8; 0.8 0.8; 0.5 0.5" keyTimes="0; 0.292; 0.708; 1" keySplines="0.333 0 0.069 0.995; 0 0 1 1; 0.167 0 0.833 1" fill="freeze" /><g transform="translate(-100,-50)"><use clip-path="url(#cp-200-100)" height="100" width="200" y="0" x="0" xlink:href="#comp_0" href="#comp_0" /></g></g></g></g><g opacity="0.971" id="Comp 1"><animate repeatCount="indefinite" begin="5.066s" calcMode="discrete" fill="freeze" dur="3.8s" values="visible; hidden" keyTimes="0; 1" attributeName="visibility" /><animate repeatCount="indefinite" attributeName="opacity" dur="3.067s" begin="5s" calcMode="spline" values="1; 0.6; 0.6; 0" keyTimes="0; 0.304; 0.696; 1" keySplines="0 0 1 1; 0 0 1 1; 0 0 1 1" fill="freeze" /><g transform="translate(150,174.062)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="3.066s" begin="5s" calcMode="spline" values="150 175; 150 123.5; 150 123.5; 150 86.5" keyTimes="0; 0.304; 0.696; 1" keySplines="0.333 0 0.182 1; 0 0 1 1; 0.167 0 0.182 1" fill="freeze" /><g transform="scale(0.996,0.996)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="3.066s" begin="5s" calcMode="spline" values="1 1; 0.8 0.8; 0.8 0.8; 0.5 0.5" keyTimes="0; 0.304; 0.696; 1" keySplines="0.333 0 0.069 0.995; 0 0 1 1; 0.167 0 0.833 1" fill="freeze" /><g transform="translate(-100,-50)"><use clip-path="url(#cp-200-100)" height="100" width="200" y="0" x="0" xlink:href="#comp_0" href="#comp_0" /></g></g></g></g><g opacity="1" id="Comp 1"><animate repeatCount="indefinite" begin="5.066s" calcMode="discrete" fill="freeze" dur="5.866s" values="visible; hidden" keyTimes="0; 1" attributeName="visibility" /><animate repeatCount="indefinite" attributeName="opacity" dur="3.067s" begin="7.066s" calcMode="spline" values="1; 0.6; 0.6; 0" keyTimes="0; 0.304; 0.696; 1" keySplines="0 0 1 1; 0 0 1 1; 0 0 1 1" fill="freeze" /><g transform="translate(150,175)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="3.066s" begin="7.066s" calcMode="spline" values="150 175; 150 123.5; 150 123.5; 150 86.5" keyTimes="0; 0.304; 0.696; 1" keySplines="0.333 0 0.182 1; 0 0 1 1; 0.167 0 0.182 1" fill="freeze" /><g transform="scale(1,1)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="3.066s" begin="7.066s" calcMode="spline" values="1 1; 0.8 0.8; 0.8 0.8; 0.5 0.5" keyTimes="0; 0.304; 0.696; 1" keySplines="0.333 0 0.069 0.995; 0 0 1 1; 0.167 0 0.833 1" fill="freeze" /><g transform="translate(-100,-50)"><use clip-path="url(#cp-200-100)" height="100" width="200" y="0" x="0" xlink:href="#comp_0" href="#comp_0" /></g></g></g></g><g opacity="1" visibility="hidden" id="Comp 1"><animate repeatCount="indefinite" begin="7.066s" calcMode="discrete" fill="freeze" dur="6s" values="visible; visible" keyTimes="0; 1" attributeName="visibility" /><animate repeatCount="indefinite" attributeName="opacity" dur="2.133s" begin="9.2s" calcMode="spline" values="1; 0.6; 0.6" keyTimes="0; 0.438; 1" keySplines="0 0 1 1; 0 0 1 1" fill="freeze" /><g transform="translate(150,175)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="2.134s" begin="9.2s" calcMode="spline" values="150 175; 150 123.5; 150 123.5" keyTimes="0; 0.438; 1" keySplines="0.333 0 0.182 1; 0 0 1 1" fill="freeze" /><g transform="scale(1,1)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="2.134s" begin="9.2s" calcMode="spline" values="1 1; 0.8 0.8; 0.8 0.8" keyTimes="0; 0.438; 1" keySplines="0.333 0 0.069 0.995; 0 0 1 1" fill="freeze" /><g transform="translate(-100,-50)"><use clip-path="url(#cp-200-100)" height="100" width="200" y="0" x="0" xlink:href="#comp_0" href="#comp_0" /></g></g></g></g><g transform="matrix(1,0,0,1,50,125)" visibility="hidden" id="Comp 1"><animate repeatCount="indefinite" begin="9.2s" calcMode="discrete" fill="freeze" dur="6s" values="visible; visible" keyTimes="0; 1" attributeName="visibility" /><use clip-path="url(#cp-200-100)" height="100" width="200" y="0" x="0" xlink:href="#comp_0" href="#comp_0" /></g></svg>`
            }}
        />
    );
}

// ─────────────────────────────────────────────
// NoticesWidget
// ─────────────────────────────────────────────

interface NoticesWidgetProps {
    notices: Notice[];
    viewAllHref?: string;
    maxHeight?: number;
    className?: string;
}

export function NoticesWidget({
    notices,
    viewAllHref = '/dashboard/notices',
    maxHeight = 380,
    className,
}: NoticesWidgetProps) {
    const [activeFilters, setActiveFilters] = useState<Set<NoticeType>>(new Set());

    const toggleFilter = (type: NoticeType) => {
        setActiveFilters((prev) => {
            const next = new Set(prev);
            next.has(type) ? next.delete(type) : next.add(type);
            return next;
        });
    };

    const clearFilters = () => setActiveFilters(new Set());

    const filtered = useMemo(() => {
        const base = [...notices].sort((a, b) => {
            // Pinned → urgent → priority → date
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;

            const priorityOrder: NoticePriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
            const pa = priorityOrder.indexOf(a.priority);
            const pb = priorityOrder.indexOf(b.priority);
            if (pa !== pb) return pa - pb;

            return b.createdAt.getTime() - a.createdAt.getTime();
        });

        if (activeFilters.size === 0) return base;
        return base.filter((n) => activeFilters.has(n.noticeType));
    }, [notices, activeFilters]);

    const hasFilters = activeFilters.size > 0;
    // Count isUrgent notices (not just URGENT priority — matches schema's dedicated boolean)
    const urgentCount = notices.filter((n) => n.isUrgent).length;

    return (
        <Card className={cn("flex flex-col min-h-0", className)}>
            <CardHeader className="flex flex-row items-center justify-between shrink-0">
                <div>
                    <CardTitle>Notice Board</CardTitle>
                    <CardDescription>Important announcements and updates</CardDescription>
                </div>
                {/* {urgentCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                        {urgentCount}
                    </span>
                )} */}
                <div className="flex items-center gap-1.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    hasFilters && 'text-blue-600'
                                )}
                            >
                                <Filter className="h-3.5 w-3.5" />
                                <span className="sr-only">Filter notices</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Filter by type
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(Object.keys(TYPE_CONFIG) as NoticeType[]).map((type) => {
                                const { label, Icon } = TYPE_CONFIG[type];
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={type}
                                        checked={activeFilters.has(type)}
                                        onCheckedChange={() => toggleFilter(type)}
                                        className="text-xs gap-2"
                                    >
                                        <Icon className="h-3 w-3 text-muted-foreground" />
                                        {label}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                            {hasFilters && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={clearFilters} className="text-xs">
                                        Clear filters
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button asChild variant="outline" size="sm" className="text-muted-foreground gap-0.5">
                        <Link href={viewAllHref}>
                            View All
                            <ChevronRight className="h-3 w-3" />
                            <span className="sr-only">View all notices</span>
                        </Link>
                    </Button>
                </div>
            </CardHeader>

            {/* Active filter pills */}
            {hasFilters && (
                <div className="flex gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex-wrap">
                    {[...activeFilters].map((type) => (
                        <button
                            key={type}
                            onClick={() => toggleFilter(type)}
                            className={cn(
                                'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-70',
                                TYPE_CONFIG[type].badge
                            )}
                        >
                            {TYPE_CONFIG[type].label}
                            <span className="ml-0.5">×</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Notices list */}
            <ScrollArea className="flex-1 min-h-0" style={{ maxHeight }}>
                {filtered.length === 0 ? (
                    hasFilters ? (
                        <div
                            className="flex flex-col items-center justify-center"
                            style={{ minHeight: maxHeight }}
                        >
                            <EmptyState
                                title="No matches"
                                description="No notices match your filters."
                                icons={[Filter, X]}
                                action={{
                                    label: "Clear filters",
                                    onClick: clearFilters,
                                    icon: X,
                                }}
                                className="border-none p-6 max-w-full"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 p-6" style={{ minHeight: maxHeight }}>
                            <ListLoadingSVG className="w-80 h-80 sm:w-72 sm:h-72" />
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-foreground">No notices yet</h3>
                                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                                    {"Announcements, events & alerts\nwill appear here."}
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    filtered.map((notice) => (
                        <NoticeRow key={notice.id} notice={notice} />
                    ))
                )}
            </ScrollArea>

            {/* Footer legend */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 scroll-x-auto whitespace-nowrap overflow-x-auto scrollbar-hide shrink-0">
                {(Object.keys(TYPE_CONFIG) as NoticeType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => toggleFilter(type)}
                        className={cn(
                            'inline-flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors',
                            activeFilters.has(type) && 'text-slate-700 dark:text-slate-300 font-medium'
                        )}
                    >
                        <span className={cn('w-1.5 h-1.5 rounded-full', TYPE_CONFIG[type].dot)} />
                        {TYPE_CONFIG[type].label}
                    </button>
                ))}
            </div>
        </Card>
    );
}