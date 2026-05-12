'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Download,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Calendar,
  AlertCircle,
  BarChart3,
  Star,
  FileDown
} from 'lucide-react';
import {
  AcademicGrowthChart,
  SubjectProficiencyRadar,
} from './PerformanceCharts';
import type {
  ExamResultWithDetails,
  ReportCardWithSession,
  UpcomingExamWithDetails,
  SubjectPerformanceStats,
  ExamEnrollmentWithDetails,
  AssignmentWithDetails,
} from '@/types/student-performance';
import { toast } from 'sonner';

interface StudentAcademicPerformanceProps {
  examResults: ExamResultWithDetails[];
  reportCards: ReportCardWithSession[];
  upcomingExams: UpcomingExamWithDetails[];
  examEnrollments: ExamEnrollmentWithDetails[];
}

export default function StudentAcademicPerformance({
  examResults = [],
  reportCards = [],
  upcomingExams = [],
  examEnrollments = [],
}: StudentAcademicPerformanceProps) {

  const [examSessionFilter, setExamSessionFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const latestReportCard = reportCards[reportCards.length - 1];


  // 1. Calculate Subject Averages & Strengths/Improvements
  const subjectPerformanceSummary = examResults.reduce((acc: Record<string, { total: number; count: number; icon: string; passed: number; failed: number }>, curr) => {
    const name = curr.exam.subject.name;
    if (!acc[name]) {
      acc[name] = { total: 0, count: 0, icon: name.charAt(0), passed: 0, failed: 0 };
    }
    const marksPercentage = curr.obtainedMarks !== null ? (curr.obtainedMarks / curr.exam.maxMarks) * 100 : 0;
    acc[name].total += marksPercentage;
    acc[name].count += curr.obtainedMarks !== null ? 1 : 0;
    if (curr.isPassed) acc[name].passed += 1;
    else if (curr.isPassed === false) acc[name].failed += 1;
    return acc;
  }, {});

  const subjectPerformance: SubjectPerformanceStats[] = Object.entries(subjectPerformanceSummary).map(([name, stats]) => ({
    name,
    average: stats.count > 0 ? Math.round(stats.total / stats.count) : 0,
    icon: stats.icon,
    totalExams: stats.count,
    passedExams: stats.passed,
    failedExams: stats.failed,
  })).sort((a, b) => b.average - a.average);

  const topPerformanceAreas = subjectPerformance.slice(0, 2);
  const improvementOpportunities = subjectPerformance.slice(-2).reverse();

  // 2. Static Assignments Data
  const assignments: AssignmentWithDetails[] = [
    {
      id: '1', title: 'Physics Lab Report', subject: 'Physics', dueDate: new Date(Date.now() + 86400000 * 3), status: 'Pending', maxMarks: 20
    },
    {
      id: '2', title: 'History Essay: World War II', subject: 'History', dueDate: new Date(Date.now() - 86400000 * 4), status: 'Graded', grade: 'A', obtainedMarks: 18, maxMarks: 20
    },
    {
      id: '3', title: 'Mathematics Algebra Quiz', subject: 'Mathematics', dueDate: new Date(Date.now() + 86400000 * 10), status: 'Pending', maxMarks: 10
    }
  ];

  // 3. Dynamic Insight Logic
  const topSubject = topPerformanceAreas[0]?.name || "your subjects";
  const averageScore = subjectPerformance.length > 0
    ? Math.round(subjectPerformance.reduce((acc, s) => acc + s.average, 0) / subjectPerformance.length)
    : 0;

  const performanceInsight = latestReportCard
    ? `You are performing exceptionally in ${topSubject}. Maintain your current ${latestReportCard.overallGrade} standing.`
    : examResults.length > 0
      ? `Your average score is ${averageScore}%. Keep focusing on ${topPerformanceAreas[0]?.name || 'your studies'} to improve further.`
      : "Performance insights will be available after your first assessment cycle.";

  // Filters logic
  const sessions = Array.from(new Set([
    ...examResults.map(p => p.exam.examSession.title),
    ...upcomingExams.map(e => e.examSession.title)
  ]));
  const subjects = Array.from(new Set([
    ...examResults.map(p => p.exam.subject.name),
    ...upcomingExams.map(e => e.subject.name)
  ]));

  const allPerformanceRecords = [
    ...examResults,
    ...upcomingExams
      .filter(e => !examResults.some(r => r.exam.id === e.id))
      .map(e => ({
        id: `upcoming-${e.id}`,
        obtainedMarks: null,
        gradeLabel: null,
        isPassed: null,
        isResultsPublished: false,
        exam: e
      }))
  ];

  const filteredPerformance = allPerformanceRecords.filter(p => {
    const sessionMatch = examSessionFilter === "all" || p.exam.examSession.title === examSessionFilter;
    const subjectMatch = subjectFilter === "all" || p.exam.subject.name === subjectFilter;
    return sessionMatch && subjectMatch;
  });

  // Transform Growth Data
  const growthData = reportCards.map(rc => ({
    period: rc.examSession.title,
    percentage: rc.percentage
  })).slice(-5);

  // Transform Radar Data
  const radarData = examResults
    .filter(p => p.obtainedMarks !== null)
    .slice(0, 6)
    .map(p => ({
      subject: p.exam.subject.name,
      score: ((p.obtainedMarks ?? 0) / p.exam.maxMarks) * 100,
      fullMark: 100
    }));

  const getGradeBadge = (grade: string) => {
    if (grade.includes('A')) return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors">{grade}</Badge>;
    if (grade.includes('B')) return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">{grade}</Badge>;
    return <Badge variant="outline">{grade}</Badge>;
  };

  const getStatusBadge = (status: string, examStatus?: string) => {
    if (examStatus === 'LIVE') {
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 animate-pulse">Live Exam</Badge>;
    }

    if (examStatus === 'UPCOMING' || examStatus === 'SCHEDULED') {
      return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Upcoming</Badge>;
    }

    switch (status.toLowerCase()) {
      case 'pass': return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Pass</Badge>;
      case 'fail': return <Badge variant="destructive">Fail</Badge>;
      case 'pending':
        if (examStatus === 'COMPLETED') {
          return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Result Awaited</Badge>;
        }
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'submitted': return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
      case 'enrolled': return <Badge variant="outline" className="text-blue-600 border-blue-200">Enrolled</Badge>;
      case 'upcoming': return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Upcoming</Badge>;
      case 'scheduled': return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Scheduled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Performance</CardTitle>
        <CardDescription>Manage exam results, report cards, and view performance insights.</CardDescription>
      </CardHeader>
      <CardContent className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-6 overflow-x-auto">
              <TabsTrigger
                value="results"
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Exam Results
              </TabsTrigger>
              <TabsTrigger
                value="report-cards"
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Report Cards
              </TabsTrigger>
              <TabsTrigger
                value="assignments"
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Assignments
              </TabsTrigger>
              <TabsTrigger
                value="enrollments"
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Enrollments
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-1 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Exam Results */}
            <TabsContent value="results" className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                  <Select value={examSessionFilter} onValueChange={setExamSessionFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sessions</SelectItem>
                      {sessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <FileDown className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>

              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Marks</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPerformance.length > 0 ? (
                      filteredPerformance.map((record, i) => {
                        const hasMarks = record.obtainedMarks !== null;
                        const isPending = !hasMarks;

                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="font-medium">{record.exam.subject.name}</div>
                              <div className="text-xs text-muted-foreground">{record.exam.examSession.title}</div>
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {isPending ? (
                                <span className="text-muted-foreground italic text-xs">Awaited</span>
                              ) : (
                                `${record.obtainedMarks} / ${record.exam.maxMarks}`
                              )}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {isPending ? "--" : `${Math.round(((record.obtainedMarks ?? 0) / record.exam.maxMarks) * 100)}%`}
                            </TableCell>
                            <TableCell className="text-center">
                              {isPending ? (
                                <Badge variant="outline" className="text-[10px] opacity-70">N/A</Badge>
                              ) : (
                                getGradeBadge(record.gradeLabel || "N/A")
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isPending
                                ? getStatusBadge("Pending", record.exam.status)
                                : getStatusBadge(record.isPassed ? "Pass" : "Fail", record.exam.status)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No results found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Report Cards */}
            <TabsContent value="report-cards" className="pt-4">
              {reportCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportCards.map((rc, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold">{rc.examSession.title}</CardTitle>
                          <CardDescription>Academic Year</CardDescription>
                        </div>
                        <Badge variant="secondary" className="font-semibold uppercase">{rc.overallGrade}</Badge>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-muted/50 rounded-lg text-center">
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">CGPA</p>
                            <p className="text-xl font-bold">{rc.cgpa?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg text-center">
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Rank</p>
                            <p className="text-xl font-bold">{rc.rank || "--"}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => toast.warning("Download feature is not available yet")}>
                          <Download className="mr-2 h-4 w-4" /> Download Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/10 rounded-xl border-2 border-dashed border-muted-foreground/20">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-7 w-7 text-primary/70" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Performance Reports Pending</h3>
                  <p className="text-sm text-muted-foreground max-w-[320px] mt-2 leading-relaxed">
                    Report cards are typically issued after all exams in a session are completed and graded. Please check back later or contact the administration.
                  </p>
                  <Button variant="outline" size="sm" className="mt-6" disabled>
                    <Download className="mr-2 h-4 w-4" /> Download All (Locked)
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Assignments */}
            <TabsContent value="assignments" className="pt-4">
              <div className="space-y-4">
                {assignments.map((assignment, i) => (
                  <Card key={i} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                            {assignment.subject.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">{assignment.title}</h4>
                            <p className="text-xs text-muted-foreground font-medium uppercase">{assignment.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Due Date</p>
                            <p className="text-sm font-semibold">
                              {assignment.dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                          {getStatusBadge(assignment.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Enrollments */}
            <TabsContent value="enrollments" className="pt-4 space-y-4">
              {examEnrollments.length > 0 ? (
                examEnrollments.map((enrollment, i) => (
                  <Card key={i} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                            {enrollment.exam.subject.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">{enrollment.exam.title}</h4>
                            <p className="text-xs text-muted-foreground font-medium uppercase">{enrollment.exam.subject.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Exam Date</p>
                            <p className="text-sm font-semibold">
                              {new Date(enrollment.exam.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          {enrollment.hallTicketIssued ? (
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-3 w-3" /> Hall Ticket
                            </Button>
                          ) : (
                            getStatusBadge(enrollment.status || "Enrolled", enrollment.exam.status)
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <Calendar className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-sm">No active enrollments</span>
                </div>
              )}
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Grade Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                      {growthData.length > 0 ? (
                        <AcademicGrowthChart data={growthData} />
                      ) : (
                        <span className="text-sm text-muted-foreground">No trend data available.</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Subject Proficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                      {radarData.length > 0 ? (
                        <SubjectProficiencyRadar data={radarData} />
                      ) : (
                        <span className="text-sm text-muted-foreground">No proficiency data.</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Strengths</CardTitle>
                    <CardDescription className="text-xs">Your top performing subjects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topPerformanceAreas.length > 0 ? topPerformanceAreas.map(s => (
                      <div key={s.name} className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{s.icon}</div>
                          <span className="text-sm font-medium">{s.name}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{s.average}%</span>
                      </div>
                    )) : (
                      <div className="h-20 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                        <span className="text-xs text-muted-foreground">Not enough data...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Areas for Improvement</CardTitle>
                    <CardDescription className="text-xs">Subjects that need more focus</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {improvementOpportunities.length > 0 ? improvementOpportunities.map(s => (
                      <div key={s.name} className="flex items-center justify-between p-2 bg-amber-50/50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">{s.icon}</div>
                          <span className="text-sm font-medium">{s.name}</span>
                        </div>
                        <span className="text-sm font-bold text-amber-700">{s.average}%</span>
                      </div>
                    )) : (
                      <div className="h-20 flex items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                        <span className="text-xs text-muted-foreground">Not enough data...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Performance Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 px-6">
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                {performanceInsight}
              </p>
              <div className="p-4 bg-muted/40 rounded-xl border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Standing</p>
                    <p className="text-xl font-bold tracking-tight">
                      {latestReportCard?.overallGrade || 'N/A'} Tier
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card shadow-sm">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 px-6 pt-6 align-middle">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Next Assessments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {upcomingExams.length > 0 ? (
                  upcomingExams.slice(0, 3).map((exam, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold">{exam.title}</div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">{exam.subject.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold">
                          {new Date(exam.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase">Scheduled</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No upcoming assessments.
                  </div>
                )}
              </div>
              <div className="p-4">
                <Button variant="ghost" className="w-full text-xs font-semibold text-muted-foreground justify-between p-0 hover:bg-transparent hover:text-primary">
                  View Full Schedule <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
