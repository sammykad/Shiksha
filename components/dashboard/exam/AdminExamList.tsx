'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Filter, Users, FileText, GraduationCap, Search, LayoutGrid, List, Calendar, Clock, MapPin, Radio, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import type { ExamMode, ExamStatus } from '@/generated/prisma/enums';
import { formatDateRange, formatDateRangeDateOnly, formatTimeRange, formatDuration } from '@/lib/utils';
import { ExamWithRelations } from './StudentExamsPage';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/ui/page-header';

type Filters = {
  q: string;
  status: 'ALL' | ExamStatus;
  mode: 'ALL' | ExamMode;
  subject: 'ALL' | string;
  session: 'ALL' | string;
  grade: 'ALL' | string;
  section: 'ALL' | string;
  view: 'cards' | 'table';
};

function toCSV(rows: ExamWithRelations[]) {
  const headers = [
    'Session',
    'Grade',
    'Section',
    'Subject',
    'Title',
    'Status',
    'Mode',
    'Evaluation Type',
    'Start',
    'End',
    'Venue',
    'Max Marks',
    'Passing Marks',
    'Duration (min)',
    'Weightage',
    'Enrolled',
    'Total Students',
  ];
  const lines = rows.map((r) =>
    [
      r.examSession.title,
      r.grade.grade,
      r.section.name,
      r.subject.name,
      r.title,
      r.status,
      r.mode,
      r.evaluationType,
      new Date(r.startDate).toISOString(),
      new Date(r.endDate).toISOString(),
      r.venue || '',
      r.maxMarks,
      r.passingMarks ?? '',
      r.durationInMinutes ?? '',
      r.weightage ?? '',
      r.examEnrollment?.length ?? 0,
      r.section._count?.students ?? 0,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [headers.join(','), ...lines].join('\n');
}



export function AdminExamList({
  exams,
  userRole,
}: {
  exams: ExamWithRelations[];
  userRole: string;
}) {
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    q: '',
    status: 'ALL',
    mode: 'ALL',
    subject: 'ALL',
    session: 'ALL',
    grade: 'ALL',
    section: 'ALL',
    view: 'cards',
  });

  const subjects = useMemo(
    () => Array.from(new Set(exams.map((e) => e.subject.name))),
    [exams]
  );
  const sessions = useMemo(
    () => Array.from(new Set(exams.map((e) => e.examSession.title))),
    [exams]
  );
  const grades = useMemo(
    () => Array.from(new Set(exams.map((e) => e.grade.grade))).sort(),
    [exams]
  );
  const sections = useMemo(
    () => Array.from(new Set(exams.map((e) => e.section.name))).sort(),
    [exams]
  );

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return exams.filter((e) => {
      const matchesQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.subject.name.toLowerCase().includes(q) ||
        e.examSession.title.toLowerCase().includes(q) ||
        (e.venue?.toLowerCase().includes(q) ?? false);
      const matchesStatus =
        filters.status === 'ALL' || e.status === filters.status;
      const matchesMode = filters.mode === 'ALL' || e.mode === filters.mode;
      const matchesSubject =
        filters.subject === 'ALL' || e.subject.name === filters.subject;
      const matchesSession =
        filters.session === 'ALL' || e.examSession.title === filters.session;
      const matchesGrade =
        filters.grade === 'ALL' || e.grade.grade === filters.grade;
      const matchesSection =
        filters.section === 'ALL' || e.section.name === filters.section;
      return (
        matchesQ &&
        matchesStatus &&
        matchesMode &&
        matchesSubject &&
        matchesSession &&
        matchesGrade &&
        matchesSection
      );
    });
  }, [filters, exams]);

  const stats = useMemo(() => {
    const total = exams.length;
    const upcoming = exams.filter((e) => e.status === 'UPCOMING').length;
    const live = exams.filter((e) => e.status === 'LIVE').length;
    const completed = exams.filter((e) => e.status === 'COMPLETED').length;
    return { total, upcoming, live, completed };
  }, [exams]);

  const handleExport = () => {
    const blob = new Blob([toCSV(filtered)], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exams-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const ToggleFilters = () => {
    setIsFiltersVisible((prev) => !prev);
  };

  return (
    <section className="px-2 space-y-3">
      <PageHeader
        title="Exam Management"
        description="Overview and management of all exams across grades and sections."
        icon={GraduationCap}
        actions={
          <>
            <Button variant="outline" onClick={handleExport} size="sm" className="w-full sm:w-auto">
              Export CSV
            </Button>
            <Button variant="secondary" asChild size="sm" className="w-full sm:w-auto">
              <Link href={'/dashboard/exam-sessions'} prefetch>
                Exam Sessions
              </Link>
            </Button>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href={'/dashboard/exams/create'} prefetch>
                Create Exam
              </Link>
            </Button>
          </>
        }
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Exams</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All scheduled exams
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Upcoming</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.upcoming}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Yet to begin
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Live Now</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.live}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Exams finished
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search exams, subjects or grades..."
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              className="pl-10"
            />
          </div>
          <div className='flex items-center gap-2'>
            <Tabs
              value={filters.view}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, view: v as Filters['view'] }))
              }
              className="w-auto"
            >
              <TabsList className="h-10 p-1 bg-muted/50 border border-border">
                <TabsTrigger
                  value="cards"
                  className="h-8 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="h-8 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant={isFiltersVisible ? 'secondary' : 'outline'}
              size={'default'}
              onClick={ToggleFilters}
              className={cn(
                "h-10 min-w-[100px]",
                isFiltersVisible && " dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>


      {/* Collapsible Filters Area */}
      {isFiltersVisible && (
        <Card className="mb-6 border-dashed">
          <CardContent className="pt-6 p-3">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Select
                  value={filters.status}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      status: v as Filters['status'],
                    }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.mode}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, mode: v as Filters['mode'] }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Modes</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="PRACTICAL">Practical</SelectItem>
                    <SelectItem value="VIVA">Viva</SelectItem>
                    <SelectItem value="TAKE_HOME">Take Home</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.grade}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, grade: v as Filters['grade'] }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Grades</SelectItem>
                    {grades.map((g) => (
                      <SelectItem key={g} value={g}>
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.section}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, section: v as Filters['section'] }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sections</SelectItem>
                    {sections.map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Select
                  value={filters.subject}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      subject: v as Filters['subject'],
                    }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.session}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      session: v as Filters['session'],
                    }))
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sessions</SelectItem>
                    {sessions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-24 px-4 h-full min-h-[400px]">
          {exams.length === 0 ? (
            <EmptyState
              title="No Exams Created"
              description="Get started by creating your first exam for any class."
              icons={[GraduationCap]}
              action={{
                label: 'Create Exam',
                href: '/dashboard/exams/create',
              }}
            />
          ) : (
            <EmptyState
              title="No Exams Found"
              description="Adjust your filters or search terms to find what you're looking for."
              icons={[FileText, Filter, Search]}
              action={{
                label: 'Clear All Filters',
                onClick: () =>
                  setFilters({
                    q: '',
                    status: 'ALL',
                    mode: 'ALL',
                    subject: 'ALL',
                    session: 'ALL',
                    grade: 'ALL',
                    section: 'ALL',
                    view: filters.view,
                  }),
              }}
            />
          )}
        </div>
      ) : filters.view === 'cards' ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <Card
              key={e.id}
              className="group relative overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200"
            >
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <Badge
                      variant={e.status}
                      className={cn(
                        'uppercase text-[10px] tracking-wider font-bold px-2 py-0.5 border-0',
                        e.status === 'LIVE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : e.status === 'UPCOMING'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : e.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      )}
                    >
                      {e.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h3
                    className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-50 line-clamp-1"
                    title={e.title}
                  >
                    <Link
                      href={`/dashboard/exams/${e.id}`}
                      className="hover:underline"
                    >
                      {e.title}
                    </Link>
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {e.subject.name} • Grade {e.grade.grade}-{e.section.name}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-2 flex-1">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase">
                        Date
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {e.startDate && e.endDate
                        ? formatDateRangeDateOnly(e.startDate, e.endDate)
                        : '-'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase">
                        Time
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {e.startDate && e.endDate
                        ? formatTimeRange(e.startDate, e.endDate)
                        : '-'}
                      {e.durationInMinutes ? ` (${formatDuration(e.durationInMinutes)})` : ''}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase">
                        Enrolled
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {e.examEnrollment?.length ?? 0} Students
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase">
                        Venue
                      </span>
                    </div>
                    <span
                      className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate"
                      title={e.venue ?? 'Not announced yet'}
                    >
                      {e.venue || 'Not announced yet'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <Separator className="w-[90%] flex justify-center items-center" />
              <div className="p-5 pt-0 mt-2 flex items-center justify-between dark:border-slate-800/50">
                <div className="flex items-center -space-x-2">
                  {e.examEnrollment?.slice(0, 3).map((enrollment, i) => (
                    <Avatar
                      key={i}
                      className="h-7 w-7 border-2 border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800"
                    >
                      <AvatarImage
                        src={enrollment.student?.user.profileImage || undefined}
                        alt={enrollment.student?.user.firstName}
                      />
                      <AvatarFallback className="text-[10px] bg-slate-100 text-slate-500">
                        {enrollment.student?.user.firstName?.[0]}
                        {enrollment.student?.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {(e.examEnrollment?.length ?? 0) > 3 && (
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-500 ring-1 ring-slate-200 z-10">
                      +{(e.examEnrollment?.length ?? 0) - 3}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs ml-auto"
                  asChild
                >
                  <Link href={`/dashboard/exams/${e.id}`}>View Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-6 border-none shadow-none">
          <CardContent className="p-0">
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Class</TableHead>
                    <TableHead className="font-bold">Exam Title</TableHead>
                    <TableHead className="font-bold">Subject</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-center font-bold">
                      Enrolled
                    </TableHead>
                    <TableHead className="text-right font-bold w-[100px]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id} className="hover:bg-slate-50/50">
                      <TableCell className='whitespace-nowrap'>
                        <div className="font-medium truncate">
                          {e.grade.grade} - {e.section.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {e.examSession.title}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium truncate line-clamp-2" >
                        {e.title}
                        {e.isResultsPublished && (
                          <span
                            className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"
                            title="Results Published"
                          />
                        )}
                      </TableCell>
                      <TableCell>{e.subject.name}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDateRange(e.startDate, e.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={e.status}
                          className={cn('border px-2 py-0.5')}
                        >
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {e.examEnrollment?.length ?? 0} /{' '}
                        {e.section._count?.students ?? '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/exams/${e.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
