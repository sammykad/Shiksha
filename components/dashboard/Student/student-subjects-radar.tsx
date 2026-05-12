'use client';

import { useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { cn, getPercentageColorBadge } from '@/lib/utils';
import { ExamResultWithDetails, ReportCardWithSession } from '@/types/student-performance';
import { TrendingUp, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewerRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT';

export interface examSessionsType {
  id: string;
  title: string;
  academicYearId: string;
}

interface SubjectRow {
  subject: string;
  score: number;
  classAvg: number;
  grade: string;
  maxMarks: number;
  obtainedMarks: number;
  evaluationType: string;
}

interface StudentSubjectsRadarProps {
  role?: ViewerRole;
  studentName?: string;
  examSessions?: examSessionsType[];
  examResults?: ExamResultWithDetails[];
  reportCards?: ReportCardWithSession[];
  activeAcademicYearId?: string;
  className?: string;
}

// ─── Chart config ─────────────────────────────────────────────────────────────

const chartConfig = {
  score: { label: 'Score', color: 'hsl(var(--chart-1))' },
  classAvg: { label: 'Class Avg', color: 'hsl(var(--chart-2))' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcStats(data: SubjectRow[], reportCard?: ReportCardWithSession) {
  if (!data.length) return null;
  const totalMax = data.reduce((s, d) => s + d.maxMarks, 0);
  const totalObtained = data.reduce((s, d) => s + d.obtainedMarks, 0);
  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  const avgScore = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length);
  const classAvgScore = Math.round(data.reduce((s, d) => s + (d.classAvg ?? 0), 0) / data.length);
  const bestSubject = data.reduce((b, c) => (c.score > b.score ? c : b), data[0]);
  const worstSubject = data.reduce((b, c) => (c.score < b.score ? c : b), data[0]);
  const gradeCount = data.reduce(
    (acc, d) => ({ ...acc, [d.grade]: (acc[d.grade] ?? 0) + 1 }),
    {} as Record<string, number>,
  );
  return { totalMax, totalObtained, overallPct, avgScore, classAvgScore, bestSubject, worstSubject, gradeCount };
}

function roleLabel(role: ViewerRole, studentName: string) {
  switch (role) {
    case 'STUDENT': return 'My Academic Performance';
    case 'PARENT': return `${studentName}'s Performance`;
    case 'TEACHER': return `${studentName}'s Performance`;
    case 'ADMIN': return `${studentName}'s Performance`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentSubjectsRadar({
  role = 'STUDENT',
  studentName = 'Student',
  examSessions = [],
  examResults = [],
  reportCards = [],
  activeAcademicYearId,
  className,
}: StudentSubjectsRadarProps) {
  // Filter sessions to active academic year only
  const filteredSessions = activeAcademicYearId
    ? examSessions.filter(s => s.academicYearId === activeAcademicYearId)
    : examSessions;

  const [showComparison, setShowComparison] = useState(false);
  const [selectedSession, setSelectedSession] = useState(filteredSessions[0]?.id ?? '');

  // Switch session when filtered list changes
  const sessionId = filteredSessions.find(s => s.id === selectedSession)
    ? selectedSession
    : (filteredSessions[0]?.id ?? '');

  // ── Derived data ────────────────────────────────────────────────────────────
  const data: SubjectRow[] = examResults
    .filter(r => r.exam?.examSessionId === sessionId)
    .map(r => ({
      subject: r.exam?.subject?.name ?? 'Unknown',
      score: r.percentage ?? 0,
      classAvg: 0,
      grade: r.gradeLabel ?? 'N/A',
      maxMarks: r.exam?.maxMarks ?? 100,
      obtainedMarks: r.obtainedMarks ?? 0,
      evaluationType: r.exam?.evaluationType ?? 'N/A',
    }));

  const currentReportCard = reportCards.find(rc => rc.examSession?.id === sessionId);
  const hasClassAvg = data.some(d => (d.classAvg ?? 0) > 0);
  const stats = calcStats(data, currentReportCard);
  const hasData = data.length > 0;
  const hasSession = filteredSessions.length > 0;

  return (
    <Card className={cn('flex flex-col h-full', className)}>

      {/* ── Header ── */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base">
              {roleLabel(role, studentName)}
            </CardTitle>
            {activeAcademicYearId && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Current academic year only
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {(role === 'ADMIN' || role === 'TEACHER') && (
              <Badge variant="secondary" className="text-[10px]">
                {role === 'ADMIN' ? 'Admin View' : 'Teacher View'}
              </Badge>
            )}
            {hasClassAvg && hasData && (
              <div className="flex items-center gap-2">
                <Switch
                  id="comparison"
                  checked={showComparison}
                  onCheckedChange={setShowComparison}
                />
                <Label htmlFor="comparison" className="text-xs text-muted-foreground cursor-pointer">
                  vs Class Avg
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Session selector */}
        <Select
          value={sessionId}
          onValueChange={setSelectedSession}
          disabled={!hasSession}
        >
          <SelectTrigger className="h-8 text-sm mt-1">
            <SelectValue placeholder={hasSession ? 'Select session' : 'No sessions available'} />
          </SelectTrigger>
          <SelectContent>
            {filteredSessions.map(s => (
              <SelectItem key={s.id} value={s.id} className="text-sm">
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="p-4 flex-1">

        {/* ── No sessions at all ── */}
        {!hasSession ? (
          <div className='flex justify-center items-center'>
            <EmptyState
              title="No Exam Sessions"
              description="No exam sessions found for the current academic year."
              icons={[BookOpen]}
            />
          </div>
        ) : !hasData ? (
          /* ── Session exists but no results ── */
          <div className='flex justify-center items-center'>
            <EmptyState
              title="No Results Yet"
              description={
                role === 'STUDENT'
                  ? "Your exam results for this session haven't been published yet."
                  : `No exam results found for ${studentName} in this session.`
              }
              icons={[GraduationCap, BarChart3, TrendingUp]}
              hint="Results will appear here once they are published by the teacher."
            />
          </div>
        ) : (
          <Tabs defaultValue="radar" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="radar" className="text-xs">Radar View</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs">Detailed Stats</TabsTrigger>
            </TabsList>

            {/* ── Radar tab ── */}
            <TabsContent value="radar" className="space-y-4 pt-4">

              {/* Summary badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Avg: {stats?.avgScore}%</Badge>
                <Badge variant="secondary">{stats?.totalObtained}/{stats?.totalMax} marks</Badge>
                {showComparison && stats && (
                  <Badge variant="outline">Class Avg: {stats.classAvgScore}%</Badge>
                )}
              </div>

              {/* Chart */}
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
                <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={({ x, y, payload }: any) => (
                      <text
                        x={x} y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-muted-foreground"
                        style={{ fontSize: 10, fontWeight: 500 }}
                      >
                        {payload.value.length > 12
                          ? `${payload.value.substring(0, 10)}…`
                          : payload.value}
                      </text>
                    )}
                  />
                  <PolarGrid stroke="hsl(var(--border))" />
                  <Radar
                    dataKey="score"
                    fill="var(--color-score)"
                    fillOpacity={0.25}
                    stroke="var(--color-score)"
                    strokeWidth={1.5}
                  />
                  {showComparison && (
                    <Radar
                      dataKey="classAvg"
                      fill="var(--color-classAvg)"
                      fillOpacity={0.12}
                      stroke="var(--color-classAvg)"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />
                  )}
                </RadarChart>
              </ChartContainer>

              {/* Subject pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{s.subject}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {s.evaluationType.toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      <Badge
                        variant={getPercentageColorBadge(s.score)}
                        className="text-[10px] px-1 py-0"
                      >
                        {s.grade}
                      </Badge>
                      <span className="text-xs font-semibold">{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--chart-1))]" />
                  {role === 'STUDENT' ? 'Your Score' : 'Score'}
                </span>
                {showComparison && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[hsl(var(--chart-2))]" />
                    Class Average
                  </span>
                )}
              </div>
            </TabsContent>

            {/* ── Summary tab ── */}
            <TabsContent value="summary" className="space-y-5 pt-4">

              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Overall</p>
                  <p className="text-2xl font-bold tabular-nums">{stats?.overallPct}%</p>
                  <p className="text-xs text-muted-foreground">{stats?.totalObtained}/{stats?.totalMax} marks</p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Class Rank</p>
                  <p className="text-2xl font-bold tabular-nums">{currentReportCard?.classRank ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">This session</p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Best Subject</p>
                  <p className="text-sm font-bold truncate">{stats?.bestSubject.subject ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{stats?.bestSubject.score}%</p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Result</p>
                  <p className="text-sm font-bold truncate">{currentReportCard?.resultStatus ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">Final status</p>
                </div>
              </div>

              <Separator />

              {/* Grade distribution */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Grade Distribution</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(stats?.gradeCount ?? {}).map(([grade, count]) => (
                    <div
                      key={grade}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs"
                    >
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{grade}</Badge>
                      <span className="font-medium text-muted-foreground">
                        {count} {count === 1 ? 'subject' : 'subjects'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Scores table — using shadcn Table */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Subject Breakdown</p>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Subject</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs text-center">Marks</TableHead>
                        <TableHead className="text-xs text-center">Grade</TableHead>
                        <TableHead className="text-xs text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium py-2.5">
                            {s.subject}
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground uppercase font-medium py-2.5">
                            {s.evaluationType}
                          </TableCell>
                          <TableCell className="text-xs text-center py-2.5">
                            <span className="font-semibold">{s.obtainedMarks}</span>
                            <span className="text-muted-foreground"> / {s.maxMarks}</span>
                          </TableCell>
                          <TableCell className="text-center py-2.5">
                            <Badge
                              variant={getPercentageColorBadge(s.score)}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {s.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs font-bold">{s.score}%</span>
                              <Progress value={s.score} className="h-1 w-16" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}