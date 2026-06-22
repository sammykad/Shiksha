'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  isPassingGrade,
  calculatePassingMarks,
  getGradeColorBadge,
  type GradingScaleInfo,
} from '@/lib/data/exam/grade-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  Download,
  CheckCircle,
  Award,
  XCircle,
  Target,
  TrendingUp,
  Search,
  Bell,
  FileCheck,
  Eye,
  BarChart3,
  GraduationCap,
  Calendar,
  UserCheck,
  UserX,
  FileBarChart2,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import ExamResultsForm from '@/components/dashboard/exam/ExamResultsForm';
import { formatDateTimeIN, formatDuration } from '@/lib/utils';
import HallTicketUI from './HallTicketUI';
import type {
  AdminExamManagementPageProps,
  StudentDataWithStatus,
  ExamStatistics,
  EnrollmentFilterType,
  TabType,
} from '@/types/exam';
import { ExamStatus } from '@/generated/prisma/enums';
import { issueHallTicketsForExam } from '@/lib/data/exam/issue-hall-tickets-for-exam';
import { notifyStudentsForExamEnrollment } from '@/lib/data/exam/notify-student-for-exam';
import { enrollStudentsInExam } from '@/lib/data/exam/enroll-students-by-admin';
import { EmptyState } from '@/components/ui/empty-state';
import { BandPreviewBar } from './BandPreviewBar';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function AdminExamManagementPage({
  exam,
  students,
  enrollments,
  results,
  hallTickets,
}: AdminExamManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollmentFilter, setEnrollmentFilter] =
    useState<EnrollmentFilterType>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [notifyDialog, setNotifyDialog] = useState(false);
  const [issueHallTicketDialog, setIssueHallTicketDialog] = useState(false);
  const [studentsToNotify, setStudentsToNotify] = useState<string[]>([]);
  const [studentsToIssueTickets, setStudentsToIssueTickets] = useState<
    string[]
  >([]);
  const [previewHallTicket, setPreviewHallTicket] = useState<any>(null);

  // Create lookup maps for O(1) access
  const enrollmentMap = useMemo(
    () => new Map(enrollments.map((e) => [e.studentId, e])),
    [enrollments]
  );

  const resultMap = useMemo(
    () => new Map(results.map((r) => [r.studentId, r])),
    [results]
  );

  const hallTicketMap = useMemo(
    () => new Map(hallTickets.map((h) => [h.studentId, h])),
    [hallTickets]
  );

  // Combine student data with their status
  const studentsData: StudentDataWithStatus[] = useMemo(() => {
    return students.map((student) => {
      const enrollment = enrollmentMap.get(student.id);
      const result = resultMap.get(student.id);
      const hallTicket = hallTicketMap.get(student.id);

      return {
        ...student,
        isEnrolled: !!enrollment,
        enrollmentStatus: enrollment?.status,
        enrollmentId: enrollment?.id,
        result,
        hallTicket,
      };
    });
  }, [students, enrollmentMap, resultMap, hallTicketMap]);

  // Calculate comprehensive statistics
  const stats: ExamStatistics = useMemo(() => {
    const enrolled = studentsData.filter((s) => s.isEnrolled);
    const notEnrolled = studentsData.filter((s) => !s.isEnrolled);

    // Only consider results from enrolled students
    const enrolledIds = new Set(enrolled.map((s) => s.id));
    const enrolledResults = results.filter((r) => enrolledIds.has(r.studentId));

    // Calculate appeared, passed, absent
    const appeared = enrolledResults.filter((r) => !r.isAbsent && r.obtainedMarks !== null);

    // Re-calculate pass/fail dynamically to ensure stats are never stale
    // even if the grading scale changed after marks were entered.
    const effectivePassed = appeared.filter(r => {
      if (!exam.gradingScale) return r.isPassed;
      const { isPassed } = isPassingGrade(r.percentage || 0, exam.gradingScale);
      return isPassed;
    });

    const absent = enrolledResults.filter((r) => r.isAbsent);

    const ticketsIssued = enrolled.filter((s) => s.hallTicket);

    // Calculate averages
    const totalMarks = appeared.reduce(
      (sum, r) => sum + (r.obtainedMarks || 0),
      0
    );
    const avgMarks = appeared.length > 0 ? totalMarks / appeared.length : 0;
    const avgPercent = avgMarks > 0 ? (avgMarks / exam.maxMarks) * 100 : 0;

    // Find top score
    const topScore =
      appeared.length > 0
        ? Math.max(...appeared.map((r) => r.obtainedMarks || 0))
        : 0;

    // Calculate passing marks
    const passingMarks = exam.gradingScale
      ? calculatePassingMarks(exam.maxMarks, exam.gradingScale)
      : (exam.passingMarks || Math.round(exam.maxMarks * 0.33));

    // Calculate rates
    const enrollmentRate =
      studentsData.length > 0
        ? (enrolled.length / studentsData.length) * 100
        : 0;

    const attendanceRate =
      enrolled.length > 0 ? (appeared.length / enrolled.length) * 100 : 0;

    const successRate =
      appeared.length > 0 ? (effectivePassed.length / appeared.length) * 100 : 0;

    return {
      totalStudents: studentsData.length,
      enrolled: enrolled.length,
      notEnrolled: notEnrolled.length,
      appeared: appeared.length,
      passed: effectivePassed.length,
      failed: appeared.length - effectivePassed.length,
      absent: absent.length,
      ticketsIssued: ticketsIssued.length,
      avgMarks: Math.round(avgMarks * 100) / 100,
      avgPercent: Math.round(avgPercent * 100) / 100,
      topScore,
      topScorePercent: topScore > 0 ? (topScore / exam.maxMarks) * 100 : 0,
      passingMarks,
      enrollmentRate,
      attendanceRate,
      successRate,
    };
  }, [studentsData, results, exam.maxMarks, exam.passingMarks]);

  // Filter students based on tab and search criteria
  const getFilteredStudents = (tab: TabType): StudentDataWithStatus[] => {
    let filtered = studentsData;

    // Apply enrollment filter
    if (enrollmentFilter === 'enrolled') {
      filtered = filtered.filter((s) => s.isEnrolled);
    } else if (enrollmentFilter === 'not-enrolled') {
      filtered = filtered.filter((s) => !s.isEnrolled);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.rollNumber.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
      );
    }

    // Tab-specific filtering
    if (tab === 'results') {
      filtered = filtered.filter((s) => s.isEnrolled);
    }

    return filtered;
  };

  // Get counts for selected students
  const getSelectedCounts = () => {
    const notEnrolledCount = selectedStudents.filter((id) => {
      const student = studentsData.find((s) => s.id === id);
      return !student?.isEnrolled;
    }).length;

    const needsTicketCount = selectedStudents.filter((id) => {
      const student = studentsData.find((s) => s.id === id);
      return student?.isEnrolled && !student?.hallTicket;
    }).length;

    return { notEnrolledCount, needsTicketCount };
  };

  const { notEnrolledCount, needsTicketCount } = getSelectedCounts();

  // Handlers
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (students: StudentDataWithStatus[]) => {
    const ids = students.map((s) => s.id);
    setSelectedStudents((prev) => (prev.length === ids.length ? [] : ids));
  };

  const handleNotifyEnrollment = () => {
    // if (selectedStudents.length === 0) {
    //   toast.error('Please select at least one student');
    //   return;
    // }

    // Filter only non-enrolled students
    const eligibleStudents = selectedStudents.filter((id) => {
      const student = studentsData.find((s) => s.id === id);
      return !student?.isEnrolled;
    });

    // if (eligibleStudents.length === 0) {
    //   toast.error('Selected students are already enrolled');
    //   return;
    // }

    setStudentsToNotify(eligibleStudents);
    setNotifyDialog(true);
  };

  const handleConfirmNotify = async () => {
    try {
      await notifyStudentsForExamEnrollment(studentsToNotify, exam.id);
      toast.success(
        `Enrollment notification sent to ${studentsToNotify.length} student(s)`
      );
      setNotifyDialog(false);
      setStudentsToNotify([]);
      setSelectedStudents([]);
    } catch (error) {
      toast.error('Failed to send notifications');
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedStudents.length === 0) return;

    // Filter only non-enrolled students
    const eligibleStudents = selectedStudents.filter((id) => {
      const student = studentsData.find((s) => s.id === id);
      return !student?.isEnrolled;
    });

    if (eligibleStudents.length === 0) {
      toast.info('Selected students are already enrolled');
      return;
    }

    try {
      toast.loading('Enrolling students...');
      const result = await enrollStudentsInExam(exam.id, eligibleStudents);
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
        setSelectedStudents([]);
      } else {
        toast.error(result.error || 'Failed to enroll students');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An unexpected error occurred');
    }
  };

  const handleIssueHallTickets = () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    // Filter only enrolled students without hall tickets
    const eligibleStudents = selectedStudents.filter((id) => {
      const student = studentsData.find((s) => s.id === id);
      return student?.isEnrolled && !student?.hallTicket;
    });

    if (eligibleStudents.length === 0) {
      toast.error(
        'Selected students are either not enrolled or already have hall tickets'
      );
      return;
    }

    setStudentsToIssueTickets(eligibleStudents);
    setIssueHallTicketDialog(true);
  };

  const handleConfirmIssueHallTickets = async () => {
    try {
      await issueHallTicketsForExam(studentsToIssueTickets, exam.id);
      toast.success(
        `Hall tickets issued to ${studentsToIssueTickets.length} student(s)`
      );
      setIssueHallTicketDialog(false);
      setStudentsToIssueTickets([]);
      setSelectedStudents([]);
    } catch (error) {
      toast.error('Failed to issue hall tickets');
    }
  };

  const handlePreviewHallTicket = (student: StudentDataWithStatus) => {
    if (!student.hallTicket) return;

    setPreviewHallTicket({
      ...student.hallTicket,
      organization: exam.organization,
      student: {
        ...student,
        grade: exam.grade,
        section: exam.section,
        phoneNumber: (student as any).phoneNumber ?? 'N/A',
      },
      examSession: exam.examSession,
      exam,
    });
  };

  return (
    <div className="space-y-6 px-2">
      {/* Exam Header */}
      <Card className="border-primary/20">
        <CardHeader className="bg-background border-b p-6 md:p-8">
          <div className="flex flex-col gap-6">
            {/* Top Row: Context & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Badge
                  variant="outline"
                  className="rounded-md border-primary/20 bg-primary/5 text-primary px-3 py-1"
                >
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  {exam.examSession.title}
                </Badge>
                <div className="h-4 w-px bg-border" />
                <Badge variant={exam.status as ExamStatus} className="rounded-md px-3 py-1">
                  {exam.status}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-9 bg-background shadow-sm hover:bg-muted/50 border-input"
              >
                <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                Export unavailable
              </Button>
            </div>

            {/* Middle Row: Title & Subject Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {exam.title}
                </h1>
              </div>
              <div className="flex items-center gap-3 text-lg text-muted-foreground">
                <span className="font-medium text-foreground/80">
                  {exam.subject.name}
                </span>
                <span className="text-muted-foreground/30">•</span>
                <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono text-foreground">
                  {exam.subject.code}
                </code>
              </div>
            </div>

            {/* Bottom Row: Metadata Grid */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-y-4 gap-x-8 pt-4 border-t border-border/40">
              {/* Class Info */}
              {exam.grade && exam.section && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Class
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      Grade {exam.grade.grade} - {exam.section.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Teacher Info */}
              {exam.section?.classTeacher?.user && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Class Teacher
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {exam.section.classTeacher.user.firstName}{' '}
                      {exam.section.classTeacher.user.lastName}
                    </p>
                  </div>
                </div>
              )}

              {/* Exam Mode */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                  <Target className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Mode
                  </p>
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {exam.mode.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3 md:ml-auto md:border-l md:pl-8 border-border/40">
                <div className="space-y-0.5 md:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDuration(exam.durationInMinutes || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Start Date */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start Date</div>
                <div className="font-semibold text-sm text-foreground mt-0.5">
                  {formatDateTimeIN(exam.startDate)}
                </div>
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">End Date</div>
                <div className="font-semibold text-sm text-foreground mt-0.5">
                  {formatDateTimeIN(exam.endDate)}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration</div>
                <div className="font-semibold text-sm text-foreground mt-0.5">
                  {formatDuration(exam.durationInMinutes || 0)}
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrollment Status */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Enrollment
                  </p>
                  <p className="text-xs text-blue-600">
                    {stats.enrollmentRate.toFixed(0)}% enrolled
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enrolled</span>
                <span className="font-semibold text-blue-900">
                  {stats.enrolled}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Not Enrolled</span>
                <span className="font-semibold text-blue-900">
                  {stats.notEnrolled}
                </span>
              </div>
              <Progress
                value={stats.enrollmentRate}
                className="h-2 bg-blue-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Attendance
                  </p>
                  <p className="text-xs text-green-600">
                    {stats.attendanceRate.toFixed(0)}% present
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Appeared</span>
                <span className="font-semibold text-green-900">
                  {stats.appeared}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Absent</span>
                <span className="font-semibold text-green-900">
                  {stats.absent}
                </span>
              </div>
              <Progress
                value={stats.attendanceRate}
                className="h-2 bg-green-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    Success Rate
                  </p>
                  <p className="text-xs text-orange-600">
                    {stats.successRate.toFixed(1)}% passed
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Passed</span>
                <span className="font-semibold text-orange-900">
                  {stats.passed}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Failed</span>
                <span className="font-semibold text-orange-900">
                  {stats.failed}
                </span>
              </div>
              <Progress
                value={stats.successRate}
                className="h-2 bg-orange-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Score */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Top Score
                  </p>
                  <p className="text-xs text-purple-600">
                    {stats.topScorePercent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Highest</span>
                <span className="font-semibold text-purple-900">
                  {stats.topScore > 0 ? stats.topScore.toFixed(1) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average</span>
                <span className="font-semibold text-purple-900">
                  {stats.avgMarks > 0 ? stats.avgMarks.toFixed(1) : '—'}
                </span>
              </div>
              <Progress
                value={stats.topScorePercent}
                className="h-2 bg-purple-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Grading Rubric Visualization */}
      {exam.gradingScale ? (
        <Card className="overflow-hidden border-primary/10 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="py-4 px-6 border-b bg-primary/[0.03]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight">Grading Configuration</CardTitle>
                  <CardDescription className="text-[11px]">Institutional standards for results calculation</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Passing Criteria</span>
                  <Badge variant="secondary" className="text-xs h-6 px-3 font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                    {stats.passingMarks} / {exam.maxMarks} ({exam.gradingScale.passThreshold}%)
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mark Rounding</span>
                  <Badge variant="outline" className="text-xs h-6 px-3 font-mono">
                    {exam.gradingScale.rounding}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-8 px-6 bg-gradient-to-b from-transparent to-muted/5">
            <BandPreviewBar
              bands={exam.gradingScale.bands}
              passThreshold={exam.gradingScale.passThreshold}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-amber-200 bg-amber-50/30">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="text-sm font-semibold text-amber-900">Missing Grading Scheme</h3>
            <p className="text-xs text-amber-700 max-w-sm mt-1">
              No institutional grading system has been selected for this exam. Results calculation and grade distribution will not be available.
            </p>
            <Button size="sm" variant="outline" className="mt-4 border-amber-200 hover:bg-amber-100 text-amber-900" asChild>
              <Link href="/dashboard/settings?section=grading">
                Configure Grading System
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="enrollment" className="gap-2">
            <Users className="h-4 w-4" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Student Enrollment */}
        <TabsContent value="enrollment" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" />
                    Student Enrollment
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Manage enrollments and hall tickets
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {studentsData.length} students
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, roll number, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <Select
                  value={enrollmentFilter}
                  onValueChange={(v: EnrollmentFilterType) => setEnrollmentFilter(v)}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="enrolled">Enrolled Only</SelectItem>
                    <SelectItem value="not-enrolled">Not Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions — only when selection is active */}
              {selectedStudents.length > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-2.5">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {selectedStudents.length}
                    </span>{' '}
                    selected
                    {notEnrolledCount > 0 && (
                      <span className="ml-2 text-xs">· {notEnrolledCount} not enrolled</span>
                    )}
                    {needsTicketCount > 0 && (
                      <span className="ml-2 text-xs">· {needsTicketCount} need tickets</span>
                    )}
                  </p>

                  <div className="flex items-center gap-2">
                    {notEnrolledCount > 0 && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleBulkEnroll}
                          className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Enroll {notEnrolledCount}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleNotifyEnrollment}
                          className="h-7 text-xs gap-1.5"
                        >
                          <Bell className="h-3.5 w-3.5" />
                          Notify {notEnrolledCount}
                        </Button>
                      </>
                    )}
                    {needsTicketCount > 0 && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleIssueHallTickets}
                        className="h-7 text-xs gap-1.5"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        Issue Tickets {needsTicketCount}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedStudents([])}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Students Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-10 pl-4">
                        <Checkbox
                          checked={
                            selectedStudents.length === getFilteredStudents('enrollment').length &&
                            getFilteredStudents('enrollment').length > 0
                          }
                          onCheckedChange={() => handleSelectAll(getFilteredStudents('enrollment'))}
                        />
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Student
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Roll No.
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Enrollment
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Hall Ticket
                      </TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {getFilteredStudents('enrollment').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-16 text-center">
                          <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                          <p className="text-sm font-medium text-muted-foreground">No students found</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Try adjusting your search or filter
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredStudents('enrollment').map((student) => (
                        <TableRow key={student.id} className="hover:bg-muted/30">

                          <TableCell className="pl-4">
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => handleSelectStudent(student.id)}
                            />
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-primary">
                                  {student.firstName[0]}{student.lastName[0]}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                              {student.rollNumber}
                            </code>
                          </TableCell>

                          <TableCell>
                            {student.isEnrolled ? (
                              <Badge variant="ENROLLED" className="gap-1 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                Enrolled
                              </Badge>
                            ) : (
                              <Badge variant="NOT_ENROLLED" className="gap-1 text-xs">
                                <XCircle className="h-3 w-3" />
                                Not Enrolled
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            {student.hallTicket ? (
                              <Badge variant="HALL_TICKET_ISSUED" className="gap-1 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                Issued
                              </Badge>
                            ) : (
                              <Badge variant="HALL_TICKET_NOT_ISSUED" className="gap-1 text-xs">
                                <XCircle className="h-3 w-3" />
                                Not Issued
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right pr-4">
                            {!student.isEnrolled ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setSelectedStudents([student.id]);
                                  handleNotifyEnrollment();
                                }}
                              >
                                <Bell className="h-3.5 w-3.5" />
                                Notify
                              </Button>
                            ) : !student.hallTicket ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setSelectedStudents([student.id]);
                                  handleIssueHallTickets();
                                }}
                              >
                                <FileCheck className="h-3.5 w-3.5" />
                                Issue
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                                onClick={() => handlePreviewHallTicket(student)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                            )}
                          </TableCell>

                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Hall Ticket Preview Dialog */}
              <Dialog
                open={!!previewHallTicket}
                onOpenChange={(open) => !open && setPreviewHallTicket(null)}
              >
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto scrollbar-hide">
                  <DialogHeader>
                    <DialogTitle>Hall Ticket Preview</DialogTitle>
                    <DialogDescription>
                      Review student examination credentials
                    </DialogDescription>
                  </DialogHeader>
                  {previewHallTicket ? (
                    <HallTicketUI data={previewHallTicket} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <FileCheck className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No hall ticket data available</p>
                      <p className="text-xs mt-1 text-muted-foreground/70">
                        This ticket could not be loaded
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Results Management */}
        <TabsContent value="results" className="space-y-4">
          <div>
            {exam.isResultsPublished && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Results Published
                    </p>
                    <p className="text-xs text-green-700">
                      Results are now visible to all students
                    </p>
                  </div>
                </div>
              </div>
            )}
            <ExamResultsForm
              exam={exam}
              students={students}
              existingResults={results}
              enrollments={enrollments}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Report Cards */}
        <TabsContent value="reports" className="space-y-4 flex items-center justify-center">
          <EmptyState
            title="Exam Reports Coming Soon"
            description="We're currently finalizing the grading process. Once published, your detailed performance analytics, subject-wise breakdowns, and rank cards will appear here."
            icons={[FileBarChart2, Award, GraduationCap]}
            hint="You'll receive a notification as soon as the results are live."
            action={{
              label: "Back to Dashboard",
              href: "/dashboard", // Or your main route
              icon: PlusCircle
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={notifyDialog} onOpenChange={setNotifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle>Send Enrollment Notification</DialogTitle>
                <DialogDescription>
                  Notify {studentsToNotify.length} student
                  {studentsToNotify.length === 1 ? '' : 's'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-blue-700" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    What will happen?
                  </p>
                  <p className="text-sm text-blue-700">
                    Selected students will receive an email notification to
                    enroll for this exam. They can then access the enrollment
                    form and submit their enrollment.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setNotifyDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmNotify} className="flex-1 gap-2">
              <Bell className="h-4 w-4" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={issueHallTicketDialog}
        onOpenChange={setIssueHallTicketDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Issue Hall Tickets</DialogTitle>
                <DialogDescription>
                  Issue tickets to {studentsToIssueTickets.length} student
                  {studentsToIssueTickets.length === 1 ? '' : 's'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-green-700" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900 mb-1">
                    What will happen?
                  </p>
                  <p className="text-sm text-green-700">
                    Hall tickets will be generated as PDF documents and sent to
                    students' registered email addresses. Students can download
                    and print their hall tickets.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIssueHallTicketDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmIssueHallTickets}
              className="flex-1 gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Issue Tickets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
