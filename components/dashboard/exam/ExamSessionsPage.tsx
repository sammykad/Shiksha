'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    CalendarIcon, Plus, Edit, Trash2, Search, MoreHorizontal,
    Clock, CheckCircle2, CalendarDays, TrendingUp, Copy, Ticket,
    FileText, BookOpen, BarChart3, AlertCircle, ChevronRight,
    Eye, Loader2, Download, GraduationCap, ExternalLink, X,
} from 'lucide-react';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { formatDateRangeDateOnly } from '@/lib/utils';
import { examSessionSchema, ExamSessionFormData } from '@/lib/schemas';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { createExamSession, updateExamSession, deleteExamSession } from '@/lib/data/exam/exam-session';
import { issueHallTicketsForSession, issueHallTicketsForSingleExam } from '@/lib/data/exam/issue-hall-tickets-for-session';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExamInSession = {
    id: string; title: string; status: string;
    startDate: Date; endDate: Date; maxMarks: number;
    subject: { name: string }; grade: { grade: string }; section: { name: string };
    _count?: { examResult: number; hallTickets: number; examEnrollment: number };
};
type StudentReportCard = {
    id: string; studentId: string; percentage: number;
    overallGrade: string; resultStatus: string; pdfUrl: string | null;
    student: { firstName: string; lastName: string; rollNumber: string };
};
type HallTicketRow = {
    studentId: string; examId: string | null; issuedAt: Date | null; pdfUrl: string;
    student: { firstName: string; lastName: string; rollNumber: string };
    exam: { title: string; subject: { name: string } } | null;
};
type ExamSession = {
    id: string; title: string; description: string | null;
    startDate: Date; endDate: Date; academicYearId: string;
    _count: { exams: number; reportCards: number };
    academicYear: { name: string };
    exams?: ExamInSession[];
    reportCards?: StudentReportCard[];
    hallTickets?: HallTicketRow[];
};
interface ExamSessionsPageProps { sessions: ExamSession[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(start: Date, end: Date) {
    const now = new Date(), s = new Date(start), e = new Date(end);
    if (now < s) return { label: 'Upcoming', variant: 'UPCOMING' as const, icon: Clock };
    if (now > e) return { label: 'Completed', variant: 'COMPLETED' as const, icon: CheckCircle2 };
    return { label: 'Active', variant: 'LIVE' as const, icon: TrendingUp };
}
function getProgressPercent(start: Date, end: Date): number {
    const now = new Date().getTime(), s = new Date(start).getTime(), e = new Date(end).getTime();
    if (now <= s) return 0;
    if (now >= e) return 100;
    return Math.round(((now - s) / (e - s)) * 100);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    className, label, value, icon: Icon, accent, delay = 0, gradient, iconColor
}: {
    className?: string; label: string; value: number; icon: React.ElementType;
    accent: string; delay?: number; gradient: string; iconColor: string;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={className}>
            <Card className="relative overflow-hidden h-full">
                <CardContent className="p-3.5">
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
                        <div className={cn('p-1.5 rounded-lg shrink-0', accent)}>
                            <Icon className={cn("h-4 w-4", iconColor)} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">{value}</div>
                    <div className={cn("absolute inset-0 pointer-events-none opacity-40", gradient)} />
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, className }: { value: number; className?: string }) {
    return (
        <div className={cn('w-full h-1.5 rounded-full bg-muted overflow-hidden', className)}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full bg-emerald-500"
            />
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[220px]">{message}</p>
        </div>
    );
}

// ─── Session Drawer (ElevenLabs-style) ───────────────────────────────────────

function SessionDrawer({ session, open, onClose }: { session: ExamSession | null; open: boolean; onClose: () => void }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [isGeneratingHT, startHT] = useTransition();

    if (!session) return null;

    const status = getStatus(session.startDate, session.endDate);
    const progress = getProgressPercent(session.startDate, session.endDate);
    const totalDays = differenceInDays(new Date(session.endDate), new Date(session.startDate));
    const elapsed = Math.max(differenceInDays(new Date(), new Date(session.startDate)), 0);

    const analytics = {
        examCount: session._count.exams,
        reportCardCount: session._count.reportCards,
        avgMarks: session.reportCards?.length
            ? Math.round(session.reportCards.reduce((a, r) => a + r.percentage, 0) / session.reportCards.length)
            : null,
        passPercent: session.reportCards?.length
            ? Math.round((session.reportCards.filter(r => r.resultStatus === 'PASSED').length / session.reportCards.length) * 100)
            : null,
    };

    const handleGenerateHT = (examId?: string) => startHT(async () => {
        try {
            if (examId) {
                const r = await issueHallTicketsForSingleExam(examId);
                if (r.success) {
                    toast.success(`${r.data?.issued ?? 0} hall ticket(s) issued`);
                    router.refresh();
                } else {
                    toast.error(r.error || 'Failed to generate hall tickets');
                }
            } else {
                const r = await issueHallTicketsForSession(session.id);
                if (r.success) {
                    toast.success(`${r.data?.totalIssued ?? 0} hall ticket(s) issued across ${r.data?.totalExams ?? 0} exam(s)`);
                    router.refresh();
                } else {
                    toast.error(r.error || 'Failed to generate hall tickets');
                }
            }
        } catch { toast.error('An unexpected error occurred'); }
    });

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
                        onClick={onClose}
                    />

                    {/* Panel — ElevenLabs style: fixed right edge, full height, white card */}
                    <motion.div
                        key="panel"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] bg-background border-l border-border shadow-2xl flex flex-col"
                    >
                        {/* ── Panel Header ── */}
                        <div className="shrink-0 px-5 py-4 border-b border-border">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Icon badge */}
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <CalendarDays className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-[15px] font-semibold text-foreground leading-tight truncate">
                                                {session.title}
                                            </h2>
                                            <Badge variant={status.variant} className="text-xs shrink-0">{status.label}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {session.academicYear.name} · {formatDateRangeDateOnly(session.startDate, session.endDate)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Progress bar — only for active sessions */}
                            {status.label === 'Active' && (
                                <div className="mt-4 space-y-1.5">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Day {elapsed} of {totalDays}</span>
                                        <span>{progress}% complete</span>
                                    </div>
                                    <ProgressBar value={progress} />
                                </div>
                            )}
                        </div>

                        {/* ── Tabs ── */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
                            <div className="shrink-0 border-b border-border px-5 bg-background">
                                <TabsList className="flex h-10 w-full bg-transparent p-0 gap-0 rounded-none">
                                    {[
                                        { value: 'overview', label: 'Overview', icon: BarChart3 },
                                        { value: 'exams', label: 'Exams', icon: BookOpen },
                                        { value: 'halltickets', label: 'Tickets', icon: Ticket },
                                        { value: 'reportcards', label: 'Reports', icon: FileText },
                                    ].map(t => (
                                        <TabsTrigger
                                            key={t.value}
                                            value={t.value}
                                            className={cn(
                                                'flex-1 h-10 text-xs font-medium gap-1.5 rounded-none border-b-2 border-transparent',
                                                'text-muted-foreground bg-transparent shadow-none',
                                                'data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                                                'hover:text-foreground transition-colors'
                                            )}
                                        >
                                            <t.icon className="h-3.5 w-3.5 shrink-0" />
                                            <span>{t.label}</span>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {/* ── Scrollable Tab Body ── */}
                            <div className="flex-1 overflow-y-auto">

                                {/* ── Overview ── */}
                                <TabsContent value="overview" className="p-5 space-y-5 mt-0">
                                    {/* Analytics grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Total Exams', value: analytics.examCount, icon: BookOpen, bg: 'bg-blue-500/10', color: 'text-blue-600 dark:text-blue-400' },
                                            { label: 'Report Cards', value: analytics.reportCardCount, icon: FileText, bg: 'bg-violet-500/10', color: 'text-violet-600 dark:text-violet-400' },
                                            { label: 'Avg. Score', value: analytics.avgMarks !== null ? `${analytics.avgMarks}%` : '—', icon: TrendingUp, bg: 'bg-emerald-500/10', color: 'text-emerald-600 dark:text-emerald-400' },
                                            { label: 'Pass Rate', value: analytics.passPercent !== null ? `${analytics.passPercent}%` : '—', icon: GraduationCap, bg: 'bg-amber-500/10', color: 'text-amber-600 dark:text-amber-400' },
                                        ].map(s => (
                                            <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                                                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                                                    <s.icon className={cn('h-4 w-4', s.color)} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                                    <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    {session.description && (
                                        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground leading-relaxed">
                                            {session.description}
                                        </div>
                                    )}

                                    {/* Session info table */}
                                    <div>
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Session Info</p>
                                        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                                            {[
                                                { label: 'Academic Year', value: session.academicYear.name },
                                                { label: 'Start Date', value: format(new Date(session.startDate), 'PPP') },
                                                { label: 'End Date', value: format(new Date(session.endDate), 'PPP') },
                                                { label: 'Duration', value: `${totalDays} days` },
                                            ].map(row => (
                                                <div key={row.label} className="flex items-center justify-between px-4 py-3 text-sm">
                                                    <span className="text-muted-foreground">{row.label}</span>
                                                    <span className="font-semibold text-foreground">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* ── Exams ── */}
                                <TabsContent value="exams" className="p-5 mt-0 space-y-2">
                                    {!session.exams || session.exams.length === 0 ? (
                                        <EmptyState icon={BookOpen} message="No exams in this session yet." />
                                    ) : session.exams.map((exam, i) => {
                                        const es = getStatus(exam.startDate, exam.endDate);
                                        return (
                                            <Link key={exam.id} href={`/dashboard/exams/${exam.id}`} onClick={onClose}>
                                                <motion.div
                                                    initial={{ opacity: 0, x: 8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent/40 transition-colors group cursor-pointer"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                            <p className="font-semibold text-sm text-foreground truncate">{exam.title}</p>
                                                            <Badge variant={es.variant} className="text-xs shrink-0">{es.label}</Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {exam.subject.name} · Grade {exam.grade.grade}-{exam.section.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {format(new Date(exam.startDate), 'PPP')} · Max: {exam.maxMarks} marks
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                                </motion.div>
                                            </Link>
                                        );
                                    })}
                                </TabsContent>

                                {/* ── Hall Tickets ── */}
                                <TabsContent value="halltickets" className="p-5 mt-0 space-y-5">
                                    {/* Session-level generate — fixed: row layout, not column */}
                                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground">Generate for Entire Session</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Issues tickets to all enrolled students across all exams.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleGenerateHT()}
                                            disabled={isGeneratingHT}
                                            className="shrink-0 gap-1.5"
                                        >
                                            {isGeneratingHT ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ticket className="h-3.5 w-3.5" />}
                                            Generate All
                                        </Button>
                                    </div>

                                    {/* Per-exam */}
                                    {session.exams && session.exams.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Per Exam</p>
                                            {session.exams.map(exam => {
                                                const issued = exam._count?.hallTickets ?? 0;
                                                const enrolled = exam._count?.examEnrollment ?? 0;
                                                return (
                                                    <div key={exam.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{exam.title}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {exam.subject.name} ·{' '}
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                    {issued}/{enrolled} issued
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <ProgressBar value={enrolled ? Math.min((issued / enrolled) * 100, 100) : 0} className="w-20 shrink-0" />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="shrink-0 h-8 text-xs gap-1"
                                                            onClick={() => handleGenerateHT(exam.id)}
                                                            disabled={isGeneratingHT}
                                                        >
                                                            <Ticket className="h-3 w-3" /> Generate
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Issued list */}
                                    {session.hallTickets && session.hallTickets.length > 0 ? (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Issued Tickets</p>
                                            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                                                {session.hallTickets.map((ht, i) => (
                                                    <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{ht.student.firstName} {ht.student.lastName}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Roll #{ht.student.rollNumber}{ht.exam ? ` · ${ht.exam.subject.name}` : ''}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {ht.issuedAt && (
                                                                <span className="text-xs text-muted-foreground">{format(new Date(ht.issuedAt), 'MMM d')}</span>
                                                            )}
                                                            <a href={ht.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                                    <Download className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState icon={Ticket} message="No hall tickets issued yet." />
                                    )}
                                </TabsContent>

                                {/* ── Report Cards ── */}
                                <TabsContent value="reportcards" className="p-5 mt-0 space-y-5">
                                    {/* CTA — fixed: row layout, not column */}
                                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground">Manage Report Cards</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Generate, preview, and manage report cards with grade & section filters.
                                            </p>
                                        </div>
                                        <Link href={`/dashboard/exam-sessions/${session.id}/reports`} onClick={onClose} className="shrink-0">
                                            <Button size="sm" className="gap-1.5 whitespace-nowrap">
                                                <ExternalLink className="h-3.5 w-3.5" /> Go to Reports
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Readiness checklist */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Readiness Checklist</p>
                                        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                                            {[
                                                {
                                                    label: 'All exams completed',
                                                    done: session.exams?.every(e => getStatus(e.startDate, e.endDate).label === 'Completed') ?? false
                                                },
                                                {
                                                    label: `${session._count.exams} exam(s) in session`,
                                                    done: session._count.exams > 0
                                                },
                                                {
                                                    label: 'Results entered for all exams',
                                                    done: session.exams?.every(e => (e._count?.examResult ?? 0) > 0) ?? false
                                                },
                                            ].map(item => (
                                                <div key={item.label} className="flex items-center gap-3 px-4 py-3 text-sm">
                                                    {item.done
                                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                        : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />}
                                                    <span className={item.done ? 'text-foreground' : 'text-amber-600 dark:text-amber-400'}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Report cards list */}
                                    {!session.reportCards || session.reportCards.length === 0 ? (
                                        <EmptyState icon={FileText} message="No report cards yet. Go to the Report Cards page to generate them." />
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                {session.reportCards.length} Report Card{session.reportCards.length !== 1 ? 's' : ''} Generated
                                            </p>
                                            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                                                {session.reportCards.map(rc => (
                                                    <div key={rc.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/40 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">
                                                                {rc.student.firstName} {rc.student.lastName}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Roll #{rc.student.rollNumber} · {rc.percentage}% · Grade {rc.overallGrade}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={rc.resultStatus === 'PASSED' ? 'LIVE' : 'COMPLETED'}
                                                                className="text-xs"
                                                            >
                                                                {rc.resultStatus}
                                                            </Badge>
                                                            {rc.pdfUrl && (
                                                                <a href={rc.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                                        <Download className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </div>
                        </Tabs>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Session Form ─────────────────────────────────────────────────────────────

function SessionForm({ form, onSubmit, isPending, mode, onCancel }: {
    form: ReturnType<typeof useForm<ExamSessionFormData>>;
    onSubmit: (data: ExamSessionFormData) => void;
    isPending: boolean; mode: 'create' | 'edit'; onCancel: () => void;
}) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Session Title</FormLabel>
                        <FormControl><Input placeholder="e.g. Annual Exams 2024" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                    {(['startDate', 'endDate'] as const).map(name => (
                        <FormField key={name} control={form.control} name={name} render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>{name === 'startDate' ? 'Start Date' : 'End Date'}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(field.value, 'PP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={d => d < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                    ))}
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Description{' '}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Add context or notes for this session..."
                                {...field}
                                className="min-h-[80px] resize-none"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <DialogFooter className="gap-2 pt-1">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={isPending} className="gap-1.5">
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isPending
                            ? (mode === 'create' ? 'Creating…' : 'Saving…')
                            : (mode === 'create' ? 'Create Session' : 'Save Changes')
                        }
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ExamSessionsPage({ sessions }: ExamSessionsPageProps) {
    const { viewingYear } = useAcademicYear();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
    const [drawerSession, setDrawerSession] = useState<ExamSession | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<ExamSessionFormData>({
        resolver: zodResolver(examSessionSchema),
        defaultValues: { title: '', description: '', academicYearId: viewingYear?.id || '' },
    });

    const filteredSessions = useMemo(() => sessions.filter(s => {
        const matchYear = !viewingYear || s.academicYearId === viewingYear.id;
        const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
            || s.academicYear.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchYear && matchSearch;
    }), [sessions, viewingYear, searchQuery]);

    const stats = useMemo(() => {
        const now = new Date();
        return [
            {
                label: 'Total Sessions',
                value: filteredSessions.length,
                icon: CalendarDays,
                accent: 'bg-blue-100 dark:bg-blue-950/50',
                iconColor: 'text-blue-600 dark:text-blue-400',
                gradient: 'bg-gradient-to-r from-blue-500/10 to-transparent',
                delay: 0,
            },
            {
                label: 'Active Now',
                value: filteredSessions.filter(s => now >= new Date(s.startDate) && now <= new Date(s.endDate)).length,
                icon: TrendingUp,
                accent: 'bg-emerald-100 dark:bg-emerald-950/50',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'bg-gradient-to-r from-emerald-500/10 to-transparent',
                delay: 0.06,
            },
            {
                label: 'Upcoming',
                value: filteredSessions.filter(s => new Date(s.startDate) > now).length,
                icon: Clock,
                accent: 'bg-amber-100 dark:bg-amber-950/50',
                iconColor: 'text-amber-600 dark:text-amber-400',
                gradient: 'bg-gradient-to-r from-amber-500/10 to-transparent',
                delay: 0.12,
            },
        ];
    }, [filteredSessions]);

    const openCreate = () => {
        form.reset({ title: '', description: '', academicYearId: viewingYear?.id || '', startDate: undefined, endDate: undefined });
        setIsCreateOpen(true);
    };
    const openEdit = (s: ExamSession) => {
        setSelectedSession(s);
        form.reset({
            title: s.title,
            description: s.description || '',
            academicYearId: s.academicYearId,
            startDate: new Date(s.startDate),
            endDate: new Date(s.endDate),
        });
        setIsEditOpen(true);
    };
    const openDupe = (s: ExamSession) => {
        form.reset({
            title: `${s.title} (Copy)`,
            description: s.description || '',
            academicYearId: s.academicYearId,
            startDate: undefined,
            endDate: undefined,
        });
        setIsCreateOpen(true);
    };

    const onSubmitCreate = (data: ExamSessionFormData) => startTransition(async () => {
        try {
            const r = await createExamSession(data);
            if (r.success) { toast.success('Session created'); setIsCreateOpen(false); form.reset(); }
            else toast.error(r.error || 'Failed to create session');
        } catch { toast.error('An unexpected error occurred'); }
    });

    const onSubmitUpdate = (data: ExamSessionFormData) => {
        if (!selectedSession) return;
        startTransition(async () => {
            try {
                const r = await updateExamSession(selectedSession.id, {
                    title: data.title,
                    description: data.description || undefined,
                    startDate: data.startDate,
                    endDate: data.endDate,
                });
                if (r.success) { toast.success('Session updated'); setIsEditOpen(false); setSelectedSession(null); }
                else toast.error(r.error || 'Failed to update');
            } catch { toast.error('An unexpected error occurred'); }
        });
    };

    const handleDelete = () => {
        if (!selectedSession) return;
        if (selectedSession._count.exams > 0) { toast.error('Remove all exams first.'); return; }
        if (selectedSession._count.reportCards > 0) { toast.error('Remove generated report cards first.'); return; }
        startTransition(async () => {
            try {
                const r = await deleteExamSession(selectedSession.id);
                if (r.success) { toast.success('Session deleted'); setIsDeleteOpen(false); setSelectedSession(null); }
                else toast.error(r.error || 'Failed to delete');
            } catch { toast.error('An unexpected error occurred'); }
        });
    };

    const canDelete = (selectedSession?._count.exams ?? 0) === 0 && (selectedSession?._count.reportCards ?? 0) === 0;

    return (
        <>
            <Card className="mx-2">
                {/* ── Header ── */}
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Exam Sessions</CardTitle>
                        <CardDescription className="mt-1">
                            Manage academic terms, semester schedules, and session blocks.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search sessions…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-sm w-full sm:w-56"
                            />
                        </div>
                        <Button onClick={openCreate} className="gap-1.5 h-9">
                            <Plus className="h-4 w-4" /> Create Session
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* ── Stats ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {stats.map((s, i) => {
                            const isLast = i === stats.length - 1;
                            const isOdd = stats.length % 2 !== 0;
                            return (
                                <StatCard
                                    key={s.label}
                                    {...s}
                                    className={isLast && isOdd ? 'col-span-2 sm:col-span-1' : ''}
                                />
                            );
                        })}
                    </div>

                    {/* ── Table ── */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Session</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Academic Year</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Duration</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resources</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide pr-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {filteredSessions.length === 0 ? (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <TableCell colSpan={5}>
                                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                                                        <CalendarDays className="h-7 w-7 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">No Sessions Found</p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {searchQuery
                                                                ? `No sessions matching "${searchQuery}"`
                                                                : "You haven't created any exam sessions yet."
                                                            }
                                                        </p>
                                                    </div>
                                                    {searchQuery && (
                                                        <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>Clear Search</Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ) : filteredSessions.map((session, idx) => {
                                        const status = getStatus(session.startDate, session.endDate);
                                        const progress = getProgressPercent(session.startDate, session.endDate);
                                        return (
                                            <motion.tr
                                                key={session.id}
                                                layout
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="group border-border hover:bg-accent/40 cursor-pointer transition-colors"
                                                onClick={() => setDrawerSession(session)}
                                            >
                                                {/* Session title + status */}
                                                <TableCell className="py-4 pl-4">
                                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                        <span className="font-semibold text-sm text-foreground">{session.title}</span>
                                                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                                                    </div>
                                                    {session.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">{session.description}</p>
                                                    )}
                                                </TableCell>

                                                {/* Academic year */}
                                                <TableCell className="py-4 whitespace-nowrap">
                                                    <Badge variant="outline" className="text-xs font-medium">{session.academicYear.name}</Badge>
                                                </TableCell>

                                                {/* Duration + progress */}
                                                <TableCell className="py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
                                                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                                        <span className="text-xs">{formatDateRangeDateOnly(session.startDate, session.endDate)}</span>
                                                    </div>
                                                    {status.label === 'Active' && (
                                                        <div className="space-y-1">
                                                            <ProgressBar value={progress} className="max-w-[100px]" />
                                                            <p className="text-[10px] text-muted-foreground">{progress}% complete</p>
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Resources counts */}
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div>
                                                            <p className="font-bold text-foreground leading-none">{session._count.exams}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Exams</p>
                                                        </div>
                                                        <div className="w-px h-5 bg-border" />
                                                        <div>
                                                            <p className="font-bold text-foreground leading-none">{session._count.reportCards}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Reports</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Actions menu */}
                                                <TableCell className="py-4 pr-4 text-right" onClick={e => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl">
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-2 py-2 cursor-pointer"
                                                                onClick={() => setDrawerSession(session)}
                                                            >
                                                                <Eye className="h-4 w-4 text-muted-foreground" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-2 py-2 cursor-pointer"
                                                                onClick={() => openEdit(session)}
                                                            >
                                                                <Edit className="h-4 w-4 text-blue-500" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-2 py-2 cursor-pointer"
                                                                onClick={() => openDupe(session)}
                                                            >
                                                                <Copy className="h-4 w-4 text-violet-500" /> Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-2 py-2 cursor-pointer text-destructive focus:text-destructive"
                                                                onClick={() => { setSelectedSession(session); setIsDeleteOpen(true); }}
                                                            >
                                                                <Trash2 className="h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* ── Drawer (ElevenLabs style) ── */}
            <SessionDrawer
                session={drawerSession}
                open={!!drawerSession}
                onClose={() => setDrawerSession(null)}
            />

            {/* ── Create Dialog ── */}
            <Dialog open={isCreateOpen} onOpenChange={v => { if (!v) form.reset(); setIsCreateOpen(v); }}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>New Exam Session</DialogTitle>
                        <DialogDescription>Create a new academic session to organise exams and reports.</DialogDescription>
                    </DialogHeader>
                    <SessionForm
                        form={form}
                        onSubmit={onSubmitCreate}
                        isPending={isPending}
                        mode="create"
                        onCancel={() => { form.reset(); setIsCreateOpen(false); }}
                    />
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog open={isEditOpen} onOpenChange={v => { if (!v) { form.reset(); setSelectedSession(null); } setIsEditOpen(v); }}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                        <DialogDescription>
                            Update the details for <strong>{selectedSession?.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <SessionForm
                        form={form}
                        onSubmit={onSubmitUpdate}
                        isPending={isPending}
                        mode="edit"
                        onCancel={() => { form.reset(); setIsEditOpen(false); setSelectedSession(null); }}
                    />
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="rounded-2xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Session</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedSession?.title}</strong>? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {!canDelete && (
                        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/8 p-4 text-sm">
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                                <p className="font-semibold text-destructive">Cannot delete this session</p>
                                <ul className="list-disc list-inside text-xs text-destructive/80 space-y-0.5">
                                    {(selectedSession?._count.exams ?? 0) > 0 && (
                                        <li>{selectedSession!._count.exams} exam(s) attached</li>
                                    )}
                                    {(selectedSession?._count.reportCards ?? 0) > 0 && (
                                        <li>{selectedSession!._count.reportCards} report card(s) generated</li>
                                    )}
                                </ul>
                                <p className="text-xs text-muted-foreground">Remove all linked records first.</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending || !canDelete}
                            className="gap-1.5"
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isPending ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}