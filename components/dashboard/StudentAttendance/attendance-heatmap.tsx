'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity } from 'lucide-react';
import { useMemo } from 'react';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY';

interface AttendanceRecord {
    date: Date | string;
    status: AttendanceStatus;
}

interface AttendanceHeatmapProps {
    attendanceData: AttendanceRecord[];
    /** How many weeks to show — defaults to 26 (6 months) */
    weeks?: number;
}

// ── helpers ────────────────────────────────────────────────────────────────

function toDateKey(d: Date) {
    return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function statusColor(status: AttendanceStatus | 'FUTURE' | 'NO_DATA') {
    switch (status) {
        case 'PRESENT':
            return 'bg-green-500 dark:bg-green-500';
        case 'LATE':
            return 'bg-yellow-400 dark:bg-yellow-400';
        case 'ABSENT':
            return 'bg-red-400 dark:bg-red-500';
        case 'HOLIDAY':
            return 'bg-purple-400 dark:bg-purple-500';
        case 'FUTURE':
            return 'bg-muted/40';
        default:
            return 'bg-muted';
    }
}

function statusLabel(status: AttendanceStatus | 'FUTURE' | 'NO_DATA') {
    switch (status) {
        case 'PRESENT': return 'Present';
        case 'LATE': return 'Late';
        case 'ABSENT': return 'Absent';
        case 'HOLIDAY': return 'Holiday';
        case 'FUTURE': return 'Upcoming';
        default: return 'No data';
    }
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── component ─────────────────────────────────────────────────────────────

export function AttendanceHeatmap({ attendanceData, weeks = 26 }: AttendanceHeatmapProps) {
    const { grid, monthMarkers, summary } = useMemo(() => {
        // Build a lookup map
        const map = new Map<string, AttendanceStatus>();
        for (const r of attendanceData) {
            const d = typeof r.date === 'string' ? new Date(r.date) : r.date;
            map.set(toDateKey(d), r.status);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start from the Sunday `weeks` weeks ago
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);

        // Build grid: array of weeks, each an array of 7 days
        const columns: Array<Array<{ date: Date; key: string; status: AttendanceStatus | 'FUTURE' | 'NO_DATA' }>> = [];
        const markers: Array<{ colIndex: number; month: number }> = [];
        let lastMonth = -1;

        const summary = { present: 0, absent: 0, late: 0, holiday: 0 };

        for (let w = 0; w < weeks; w++) {
            const col = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + w * 7 + d);
                const key = toDateKey(date);
                const isFuture = date > today;
                const raw = map.get(key);
                const status: AttendanceStatus | 'FUTURE' | 'NO_DATA' = isFuture
                    ? 'FUTURE'
                    : raw ?? 'NO_DATA';

                if (raw) {
                    if (raw === 'PRESENT') summary.present++;
                    else if (raw === 'ABSENT') summary.absent++;
                    else if (raw === 'LATE') summary.late++;
                    else if (raw === 'HOLIDAY') summary.holiday++;
                }

                // Track month label position (first day of each new month)
                if (d === 0 && date.getMonth() !== lastMonth) {
                    markers.push({ colIndex: w, month: date.getMonth() });
                    lastMonth = date.getMonth();
                }

                col.push({ date, key, status });
            }
            columns.push(col);
        }

        return { grid: columns, monthMarkers: markers, summary };
    }, [attendanceData, weeks]);

    return (
        <TooltipProvider delayDuration={100}>
            <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            Attendance Activity
                        </CardTitle>
                        {/* Summary pills */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />
                                {summary.present} Present
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
                                {summary.absent} Absent
                            </span>
                            {summary.late > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-sm bg-yellow-400 inline-block" />
                                    {summary.late} Late
                                </span>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-4 pb-4">
                    <div className="overflow-x-auto">
                        <div className="min-w-0">
                            {/* Month labels */}
                            <div className="flex mb-1" style={{ paddingLeft: '2rem' }}>
                                {grid.map((_, wi) => {
                                    const marker = monthMarkers.find((m) => m.colIndex === wi);
                                    return (
                                        <div key={wi} className="flex-1 min-w-0">
                                            {marker ? (
                                                <span className="text-[10px] text-muted-foreground leading-none">
                                                    {MONTH_NAMES[marker.month]}
                                                </span>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Grid */}
                            <div className="flex gap-0.5">
                                {/* Day labels */}
                                <div className="flex flex-col gap-0.5 mr-1 shrink-0">
                                    {DAY_LABELS.map((day, i) => (
                                        <div
                                            key={day}
                                            className="text-[10px] text-muted-foreground leading-none flex items-center"
                                            style={{ height: '0.875rem', visibility: i % 2 === 0 ? 'hidden' : 'visible' }}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Cells */}
                                {grid.map((week, wi) => (
                                    <div key={wi} className="flex flex-col gap-0.5">
                                        {week.map(({ date, key, status }) => (
                                            <Tooltip key={key}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`
                              w-3.5 h-3.5 rounded-[2px] transition-all duration-150
                              hover:ring-1 hover:ring-foreground/30 hover:scale-110 cursor-default
                              ${statusColor(status)}
                            `}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs">
                                                    <p className="font-medium">{statusLabel(status)}</p>
                                                    <p className="text-muted-foreground">
                                                        {date.toLocaleDateString('en-IN', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground" style={{ paddingLeft: '2rem' }}>
                                <span>Less</span>
                                <div className="flex items-center gap-0.5">
                                    <div className="w-3 h-3 rounded-[2px] bg-muted" />
                                    <div className="w-3 h-3 rounded-[2px] bg-red-400 dark:bg-red-500" />
                                    <div className="w-3 h-3 rounded-[2px] bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-[2px] bg-green-400" />
                                    <div className="w-3 h-3 rounded-[2px] bg-green-600" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}