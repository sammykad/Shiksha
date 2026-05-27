'use client';

import React, { useState, useEffect, useMemo, useTransition, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon,
  CheckIcon,
  XIcon,
  Clock,
  Copy,
  Users,
  AlertTriangle,
  Loader2,
  BookOpen,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getAttendanceByDateAndSection, getSectionPreviousDayAttendance } from '@/app/actions';

import { EmptyState } from '@/components/ui/empty-state';
import { format, subDays, compareDesc } from 'date-fns';
import { cn, toISTDate, formatDateTimeIN } from '@/lib/utils';
import { markAttendance } from '@/lib/data/attendance/mark-attendance';
import { toastNotifyResult } from '@/lib/notifications/use-notify-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | null;

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  section: { id: string; name: string } | null;
  profileImage: string | null;
  gradeId: string;
  grade: { grade: string } | null;
  StudentAttendance: Array<{
    id: string;
    date: Date;
    status: AttendanceStatus;
    note: string | null;
    recordedBy: string;
    sectionId: string;
    createdAt: Date;
  }>;
};

type AttendanceRecord = {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  profileImage: string | null;
  sectionId: string | null;
  status: AttendanceStatus;
  note: string;
  marked: boolean;
  lastAttendance?: {
    status: AttendanceStatus;
    date: Date;
    createdAt: Date;
  };
  recordedAt?: Date;
};

type AttendanceStats = {
  present: number;
  absent: number;
  late: number;
  percentage: number;
  unmarked: number;
};

interface Props {
  students: Student[];
  grades: { id: string; grade: string }[];
  sections: { id: string; name: string; gradeId: string }[];
}

// ─── Module-level helpers (no component deps) ────────────────────────────────

const NOTE_SUGGESTIONS: Record<string, string[]> = {
  ABSENT: [
    '{name} was absent today. Consider following up with parents.',
    '{name} missed class. May need to catch up on today\'s lesson.',
    '{name} was not present. Check if there are any ongoing issues.',
  ],
  LATE: [
    '{name} arrived late to class. Discuss punctuality importance.',
    '{name} was tardy. Consider discussing time management strategies.',
    '{name} came in late. May have missed important announcements.',
  ],
  PRESENT: [
    '{name} was present and engaged in class.',
    '{name} attended class regularly.',
    '{name} was present for today\'s session.',
  ],
};

const generateNoteSuggestion = (studentName: string, status: AttendanceStatus): string => {
  if (!status) return '';
  const pool = NOTE_SUGGESTIONS[status] ?? [];
  const template = pool[Math.floor(Math.random() * pool.length)] ?? '';
  return template.replace('{name}', studentName);
};

const createAttendanceRecord = (
  student: Student,
  selectedSection: string
): AttendanceRecord => {
  const last = student.StudentAttendance
    .slice()
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .find((a) => a.sectionId === selectedSection);

  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    rollNumber: student.rollNumber,
    profileImage: student.profileImage,
    sectionId: student.section?.id || null,
    status: null,
    note: '',
    marked: false,
    lastAttendance: last
      ? { status: last.status, date: last.date, createdAt: last.createdAt }
      : undefined,
  };
};

const getStatusBadge = (status: AttendanceStatus) => {
  switch (status) {
    case 'PRESENT':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
          <CheckIcon className="w-3 h-3 mr-1" />Present
        </Badge>
      );
    case 'ABSENT':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">
          <XIcon className="w-3 h-3 mr-1" />Absent
        </Badge>
      );
    case 'LATE':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">
          <Clock className="w-3 h-3 mr-1" />Late
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-muted-foreground">Not Marked</Badge>;
  }
};

// ─── StudentCard (memoized — only re-renders when its own data changes) ───────

interface StudentCardProps {
  student: AttendanceRecord;
  attendancePercentage: number;
  disabled?: boolean;
  onStatusChange: (id: string, status: AttendanceStatus) => void;
  onNoteChange: (id: string, note: string) => void;
  onAISuggest: (id: string) => void;
}

const StudentCard = React.memo(function StudentCard({
  student,
  attendancePercentage,
  disabled = false,
  onStatusChange,
  onNoteChange,
  onAISuggest,
}: StudentCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          {/* Student Info */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-2 md:gap-3 cursor-pointer">
                <div className="relative">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage
                      className="object-cover"
                      src={student.profileImage || undefined}
                      alt={`${student.firstName} ${student.lastName}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {student.firstName[0]}{student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm md:text-lg truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <Badge variant="outline" className="text-[10px] h-4">
                      #{student.rollNumber}
                    </Badge>
                  </div>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
                    Attendance: {attendancePercentage}%
                  </p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={student.profileImage || undefined}
                      alt={`${student.firstName} ${student.lastName}`}
                    />
                    <AvatarFallback>
                      {student.firstName[0]}{student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                    <p className="text-sm text-muted-foreground">Roll Number: {student.rollNumber}</p>
                  </div>
                </div>

                <Separator />

                {student.lastAttendance && (
                  <div>
                    <p className="text-sm font-medium mb-1">Last Attendance:</p>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(student.lastAttendance.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTimeIN(student.lastAttendance.createdAt)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-1">Overall Performance:</p>
                  <div className="flex items-center gap-2">
                    <Progress value={attendancePercentage} className="flex-1 h-2" />
                    <span className={cn(
                      'text-sm font-medium',
                      attendancePercentage >= 95
                        ? 'text-green-600 dark:text-green-400'
                        : attendancePercentage >= 90
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    )}>
                      {attendancePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              size="sm"
              variant={student.status === 'PRESENT' ? 'default' : 'outline'}
              onClick={() => onStatusChange(student.id, 'PRESENT')}
              disabled={disabled}
              className={cn(
                'h-8 md:h-9 flex-1 sm:flex-none text-xs md:text-sm',
                student.status === 'PRESENT' && 'bg-green-500 hover:bg-green-600 text-white'
              )}
            >
              <CheckIcon className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />Present
            </Button>
            <Button
              size="sm"
              variant={student.status === 'ABSENT' ? 'default' : 'outline'}
              onClick={() => onStatusChange(student.id, 'ABSENT')}
              disabled={disabled}
              className={cn(
                'h-8 md:h-9 flex-1 sm:flex-none text-xs md:text-sm',
                student.status === 'ABSENT' && 'bg-red-500 hover:bg-red-600 text-white'
              )}
            >
              <XIcon className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />Absent
            </Button>
            <Button
              size="sm"
              variant={student.status === 'LATE' ? 'default' : 'outline'}
              onClick={() => onStatusChange(student.id, 'LATE')}
              disabled={disabled}
              className={cn(
                'h-8 md:h-9 flex-1 sm:flex-none text-xs md:text-sm',
                student.status === 'LATE' && 'bg-yellow-500 hover:bg-yellow-600 text-white'
              )}
            >
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />Late
            </Button>
          </div>
        </div>

        {/* Note Section */}
        {(student.status === 'ABSENT' || student.status === 'LATE') && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Note{' '}
                {student.status === 'ABSENT' ? '(Absence Reason)' : '(Late Arrival Details)'}
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAISuggest(student.id)}
                disabled={disabled}
                className="h-7 text-xs p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border-dashed border-blue-500 shadow-lg"
              >
                <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                AI Suggest
              </Button>
            </div>
            <Textarea
              placeholder={
                student.status === 'ABSENT'
                  ? 'Reason for absence, follow-up actions needed...'
                  : 'Reason for lateness, time arrived, follow-up actions...'
              }
              value={student.note}
              onChange={(e) => onNoteChange(student.id, e.target.value)}
              disabled={disabled}
              className="h-20 resize-none placeholder:text-muted-foreground text-muted-foreground"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AttendanceMark({ students, grades, sections }: Props) {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(toISTDate(new Date()));
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isCopyingPrevious, setIsCopyingPrevious] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState<'loading' | 'new' | 'edit'>('loading');
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    type: 'date' | 'grade' | 'section' | 'leave';
    value: any;
  } | null>(null);
  const attendanceCheckRef = useRef(0);

  // ── Derived stats (useMemo — no extra render cycle) ───────────────────────
  const attendanceStats = useMemo<AttendanceStats>(() => {
    const presentCount = attendanceData.filter(
      (s) => s.status === 'PRESENT' || s.status === 'LATE'
    ).length;
    const total = attendanceData.length;
    return {
      present: attendanceData.filter((s) => s.status === 'PRESENT').length,
      absent: attendanceData.filter((s) => s.status === 'ABSENT').length,
      late: attendanceData.filter((s) => s.status === 'LATE').length,
      unmarked: attendanceData.filter((s) => s.status === null).length,
      percentage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
    };
  }, [attendanceData]);

  // ── Pre-computed attendance % per student — O(n) once, not O(n²) per render
  const attendancePercentageMap = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const student of students) {
      const total = student.StudentAttendance.length;
      if (total === 0) { map.set(student.id, 100); continue; }
      const present = student.StudentAttendance.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE'
      ).length;
      map.set(student.id, Math.round((present / total) * 100));
    }
    return map;
  }, [students]);

  // ── Sections for selected grade ───────────────────────────────────────────
  const availableSections = useMemo(
    () => sections.filter((s) => s.gradeId === selectedGrade),
    [selectedGrade, sections]
  );

  // ── Unsaved-changes browser guard ─────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ── Auto-select first grade & section on mount ────────────────────────────
  useEffect(() => {
    if (grades.length > 0 && !selectedGrade) {
      const firstGrade = grades[0].id;
      setSelectedGrade(firstGrade);
      const firstSection = sections.find((s) => s.gradeId === firstGrade)?.id;
      if (firstSection) setSelectedSection(firstSection);
    }
  }, [grades, sections, selectedGrade]);

  // ── Reset attendanceData when section changes ─────────────────────────────
  useEffect(() => {
    if (!selectedSection) {
      setAttendanceData([]);
      return;
    }
    const sectionStudents = students
      .filter((s) => s.section?.id === selectedSection)
      .map((student) => createAttendanceRecord(student, selectedSection));
    setAttendanceData(sectionStudents);
  }, [selectedSection, students]);

  // ── Fetch existing attendance for date+section (deduplicated via ref) ─────
  const prevCheckRef = useRef<{ sectionId: string; date: string } | null>(null);

  useEffect(() => {
    if (!selectedSection) return;

    const dateKey = selectedDate.toISOString();

    if (
      prevCheckRef.current?.sectionId === selectedSection &&
      prevCheckRef.current?.date === dateKey
    ) return;

    prevCheckRef.current = { sectionId: selectedSection, date: dateKey };
    const requestId = attendanceCheckRef.current + 1;
    attendanceCheckRef.current = requestId;

    const checkExisting = async () => {
      const sectionStudents = students.filter((s) => s.section?.id === selectedSection);
      if (sectionStudents.length === 0) {
        if (requestId !== attendanceCheckRef.current) return;
        setAttendanceMode('new');
        setIsFetchingAttendance(false);
        return;
      }

      setIsFetchingAttendance(true);
      setAttendanceMode('loading');

      try {
        const existing = await getAttendanceByDateAndSection(selectedSection, selectedDate);

        if (requestId !== attendanceCheckRef.current) return;

        if (existing.length > 0) {
          setAttendanceData((prev) =>
            prev.map((student) => {
              const record = existing.find((r) => r.studentId === student.id);
              return record
                ? {
                  ...student,
                  status: record.status,
                  note: record.note || '',
                  marked: true,
                  recordedAt: record.createdAt,
                }
                : { ...student, status: null, note: '', marked: false };
            })
          );
          setAttendanceMode('edit');
        } else {
          setAttendanceData((prev) =>
            prev.map((student) => ({ ...student, status: null, note: '', marked: false }))
          );
          setAttendanceMode('new');
        }
        setHasUnsavedChanges(false);
      } catch {
        if (requestId !== attendanceCheckRef.current) return;
        toast.error('Failed to check attendance status');
        setAttendanceMode('new');
      } finally {
        if (requestId === attendanceCheckRef.current) {
          setIsFetchingAttendance(false);
        }
      }
    };

    checkExisting();
  }, [selectedSection, selectedDate, students]);

  // ── Handlers (all memoized) ───────────────────────────────────────────────

  const handleParamChange = useCallback(
    (type: 'date' | 'grade' | 'section', value: any) => {
      if (hasUnsavedChanges) {
        setPendingChange({ type, value });
        setShowCancelWarning(true);
        return;
      }
      if (type === 'date') setSelectedDate(value);
      if (type === 'grade') {
        setSelectedGrade(value);
        const firstSection = sections.find((s) => s.gradeId === value)?.id;
        setSelectedSection(firstSection || '');
      }
      if (type === 'section') setSelectedSection(value);
    },
    [hasUnsavedChanges, sections]
  );

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingChange({ type: 'leave', value: '/dashboard/attendance' });
      setShowCancelWarning(true);
    } else {
      router.push('/dashboard/attendance');
    }
  }, [hasUnsavedChanges, router]);

  const confirmCancel = useCallback(() => {
    setHasUnsavedChanges(false);
    setShowCancelWarning(false);

    if (pendingChange) {
      if (pendingChange.type === 'leave') {
        router.push(pendingChange.value);
      } else if (pendingChange.type === 'date') {
        setSelectedDate(pendingChange.value);
      } else if (pendingChange.type === 'grade') {
        setSelectedGrade(pendingChange.value);
        const firstSection = sections.find((s) => s.gradeId === pendingChange.value)?.id;
        setSelectedSection(firstSection || '');
      } else if (pendingChange.type === 'section') {
        setSelectedSection(pendingChange.value);
      }
      setPendingChange(null);
    } else {
      router.push('/dashboard/attendance');
    }
  }, [pendingChange, router, sections]);

  const handleStatusChange = useCallback((id: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => {
      const student = prev.find((s) => s.id === id);
      if (student?.status === status) return prev;
      return prev.map((s) => s.id === id ? { ...s, status, marked: true } : s);
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleNoteChange = useCallback((id: string, note: string) => {
    setAttendanceData((prev) => {
      const student = prev.find((s) => s.id === id);
      if (student?.note === note) return prev;
      return prev.map((s) => s.id === id ? { ...s, note, marked: true } : s);
    });
    setHasUnsavedChanges(true);
  }, []);

  const markAllWithStatus = useCallback((status: AttendanceStatus) => {
    setAttendanceData((prev) => prev.map((s) => ({ ...s, status, marked: true })));
    setHasUnsavedChanges(true);
    toast.success(`All students marked as ${status?.toLowerCase()}`, {
      description: `${attendanceData.length} students updated.`,
      position: 'bottom-left',
    });
  }, [attendanceData.length]);

  const copyPreviousDayAttendance = useCallback(async () => {
    setIsCopyingPrevious(true);
    try {
      const previousDay = subDays(selectedDate, 1);
      const previousAttendances = await getSectionPreviousDayAttendance(selectedSection, selectedDate);

      setAttendanceData((prev) =>
        prev.map((student) => {
          const prevRecord = previousAttendances.find((r) => r.studentId === student.id);
          return prevRecord
            ? { ...student, status: prevRecord.status, note: prevRecord.note || '', marked: true }
            : student;
        })
      );
      setHasUnsavedChanges(true);
      toast.success("Previous day's attendance copied!", {
        description: `Data from ${format(previousDay, 'PPP')} applied.`,
      });
    } catch {
      toast.error("Failed to copy previous day's attendance");
    } finally {
      setIsCopyingPrevious(false);
    }
  }, [selectedDate, selectedSection]);

  const generateAISuggestion = useCallback((studentId: string) => {
    const student = attendanceData.find((s) => s.id === studentId);
    if (!student || !student.status) return;

    try {
      const suggestion = generateNoteSuggestion(
        `${student.firstName} ${student.lastName}`,
        student.status
      );
      handleNoteChange(studentId, suggestion);
    } catch {
      toast.error('Failed to generate suggestion', {
        description: 'Please try again or write the note manually.',
      });
    }
  }, [attendanceData, handleNoteChange]);

  const handleSubmit = useCallback(() => {
    const unmarkedStudents = attendanceData.filter((s) => s.status === null);
    if (unmarkedStudents.length > 0) {
      toast.warning(
        `${unmarkedStudents.length} student${unmarkedStudents.length > 1 ? 's' : ''} still unmarked`,
        {
          description: unmarkedStudents.map((s) => `${s.firstName} ${s.lastName}`).join(', '),
          action: {
            label: 'Mark All Present',
            onClick: () => markAllWithStatus('PRESENT'),
          },
          duration: 6000,
        }
      );
      return;
    }
    setShowConfirmation(true);
  }, [attendanceData, markAllWithStatus]);

  const confirmSubmit = useCallback(() => {
    startTransition(async () => {
      try {
        const records = attendanceData
          .filter((s) => s.status !== null)
          .map((s) => ({
            studentId: s.id,
            status: s.status as 'PRESENT' | 'ABSENT' | 'LATE',
            note: s.note || '',
          }));

        const result = await markAttendance({ sectionId: selectedSection, selectedDate, records });

        toast.success('Attendance saved successfully!', {
          description: `Attendance for ${format(selectedDate, 'PPP')} recorded for ${records.length} students.`,
        });

        result.notifyResults.forEach(({ templateId, ...r }) => toastNotifyResult(templateId, r));
        setShowConfirmation(false);
        setHasUnsavedChanges(false);
        router.push('/dashboard/attendance/analytics');
      } catch {
        toast.error('Failed to save attendance', {
          description: 'Please try again or contact support.',
        });
      }
    });
  }, [attendanceData, selectedSection, selectedDate, router]);

  // ─── Early returns ────────────────────────────────────────────────────────

  if (grades.length === 0) {
    return (
      <main className="px-2 md:p-4 flex items-center justify-center min-h-[400px]">
        <EmptyState
          title="No Grades Setup"
          description="Your organization doesn't have any grades setup yet. To start managing attendance, add your first grade."
          icons={[GraduationCap, BookOpen, Users]}
          image="/EmptyState.png"
          hint="Tip: Make sure grades and sections are set up before marking attendance."
          action={{ label: 'Create Grade', href: '/dashboard/classes' }}
        />
      </main>
    );
  }

  if (sections.length === 0) {
    return (
      <main className="px-2 md:p-4 flex items-center justify-center min-h-[400px]">
        <EmptyState
          title="No Sections Setup"
          description="You have grades but no sections have been created yet. Attendance is tracked at the section level."
          icons={[BookOpen, GraduationCap, Users]}
          image="/EmptyState.png"
          hint="Tip: Add sections to your grades in the Class Management section."
          action={{ label: 'Add Sections', href: '/dashboard/classes' }}
        />
      </main>
    );
  }

  if (students.length === 0) {
    return (
      <main className="px-2 md:p-4 flex items-center justify-center min-h-[400px]">
        <EmptyState
          title="No Students Registered"
          description="Your organization doesn't have any students yet. Add students to your sections to start tracking attendance."
          icons={[Users, GraduationCap, BookOpen]}
          image="/EmptyState.png"
          hint="Tip: You can bulk import students or add them manually."
          action={{ label: 'Add Students', href: '/dashboard/students/create' }}
        />
      </main>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="px-2 md:p-4 space-y-6">
      {/* Session Configuration */}
      <Card>
        <CardHeader className="p-4 md:pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg border-b border-blue-200/30 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 md:gap-3 text-sm md:text-xl">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Session Configuration
              </CardTitle>
              <CardDescription className="mt-1 md:mt-2 text-xs md:text-sm hidden sm:block">
                Set up your attendance session with precise parameters
              </CardDescription>
            </div>

            {selectedSection && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                {isFetchingAttendance ? (
                  <Loader2 className="h-3 w-3 animate-spin text-blue-600 dark:text-blue-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
                <span
                  className={cn(
                    'text-[10px] md:text-sm font-medium',
                    isFetchingAttendance
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-green-700 dark:text-green-400'
                  )}
                >
                  {isFetchingAttendance ? 'Syncing' : 'Ready'}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 md:p-6">
          <div className="grid gap-3 md:gap-8 md:grid-cols-3">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10 md:h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <CalendarIcon className="mr-2 md:mr-3 h-4 w-4 text-blue-500" />
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="font-medium text-xs md:text-sm truncate">
                        {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && handleParamChange('date', toISTDate(date))}
                    initialFocus
                    disabled={(date) => toISTDate(date) > toISTDate(new Date())}
                    className="rounded-md border shadow-lg"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Grade Select */}
            <div className="space-y-1.5">
              <Select onValueChange={(val) => handleParamChange('grade', val)} value={selectedGrade}>
                <SelectTrigger className="h-10 md:h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <SelectValue placeholder="Select Grade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id} className="py-2 md:py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="font-medium text-xs md:text-sm">{grade.grade}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Select */}
            <div className="space-y-1.5">
              <Select
                onValueChange={(val) => handleParamChange('section', val)}
                value={selectedSection}
                disabled={!selectedGrade || availableSections.length === 0}
              >
                <SelectTrigger className="h-10 md:h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <SelectValue
                      placeholder={
                        !selectedGrade
                          ? 'Select grade first'
                          : availableSections.length === 0
                            ? 'No sections'
                            : 'Select section'
                      }
                    />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map((section) => (
                    <SelectItem key={section.id} value={section.id} className="py-2 md:py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-medium text-xs md:text-sm">{section.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section-level guards */}
      {!selectedSection ? (
        <div className="flex justify-center items-center py-10">
          <EmptyState
            title="Select a Section"
            description="Please select a grade and section above to start marking attendance."
            icons={[Users, GraduationCap, BookOpen]}
            image="/EmptyState.png"
            compact
          />
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <EmptyState
            title="No Students in This Section"
            description={`The selected section "${sections.find((s) => s.id === selectedSection)?.name}" doesn't have any students enrolled yet.`}
            icons={[Users, GraduationCap, BookOpen]}
            image="/EmptyState.png"
            hint="Try selecting a different section or add students to this section first."
            action={{ label: 'Add Students', href: '/dashboard/students/create' }}
          />
        </div>
      ) : (
        <>
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <h1 className="flex items-center space-x-3 gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Attendance Mark
                </h1>
                <div className="text-xl font-bold text-primary">
                  {attendanceStats.percentage}%
                </div>
              </CardTitle>
              <Progress value={attendanceStats.percentage} className="h-2 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="relative flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-green-50 dark:bg-green-900/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-green-200 dark:border-green-800">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-[10px] md:text-xs font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide">Present</p>
                    <p className="text-lg md:text-xl font-bold text-green-700 dark:text-green-400">{attendanceStats.present}</p>
                  </div>
                </div>
                <div className="relative flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-red-50 dark:bg-red-900/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-red-200 dark:border-red-800">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-[10px] md:text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide">Absent</p>
                    <p className="text-lg md:text-xl font-bold text-red-700 dark:text-red-400">{attendanceStats.absent}</p>
                  </div>
                </div>
                <div className="relative flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-yellow-200 dark:border-yellow-800">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-[10px] md:text-xs font-semibold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide">Late</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-700 dark:text-yellow-400">{attendanceStats.late}</p>
                  </div>
                </div>
                <div className="relative flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-800">
                  <div className="w-4 h-4 rounded-full bg-gray-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-300 uppercase tracking-wide">Unmarked</p>
                    <p className="text-xl font-bold text-gray-700 dark:text-gray-400">{attendanceStats.unmarked}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List Card */}
          <Card className="mb-5">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-4 w-4" />
                  {grades.find((g) => g.id === selectedGrade)?.grade} -{' '}
                  {sections.find((s) => s.id === selectedSection)?.name}
                </CardTitle>
                <CardDescription>
                  {attendanceData.length} students • {format(selectedDate, 'MMM dd, yyyy')}
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={copyPreviousDayAttendance}
                  disabled={isCopyingPrevious || isFetchingAttendance}
                  className="h-9"
                >
                  {isCopyingPrevious ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Copy Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => markAllWithStatus('PRESENT')}
                  disabled={isFetchingAttendance}
                  className="h-9"
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  All Present
                </Button>
              </div>

              <div className="w-full mb-4">
                {isFetchingAttendance ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-sm text-blue-800 dark:text-blue-400">
                        Syncing existing attendance records. The student list is ready.
                      </span>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-blue-400 text-blue-700 dark:text-blue-400">
                      Syncing
                    </Badge>
                  </div>
                ) : attendanceMode === 'edit' ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-sm text-amber-800 dark:text-amber-400">
                        Attendance already recorded for{' '}
                        <strong>
                          {attendanceData.find((s) => s.recordedAt)?.recordedAt
                            ? formatDateTimeIN(attendanceData.find((s) => s.recordedAt)!.recordedAt)
                            : format(selectedDate, 'PPP')}
                        </strong>
                        . Any changes will overwrite existing records.
                      </span>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-amber-400 text-amber-700 dark:text-amber-400">
                      Editing
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                      <span className="text-sm text-green-800 dark:text-green-400">
                        No attendance recorded for <strong>{format(selectedDate, 'PPP')}</strong>.
                        Mark attendance below.
                      </span>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-green-400 text-green-700 dark:text-green-400">
                      New
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="h-[56vh] pr-3 sm:h-[60vh]">
                <div className="flex flex-col gap-4">
                {attendanceData.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    attendancePercentage={attendancePercentageMap.get(student.id) ?? 100}
                    disabled={isFetchingAttendance}
                    onStatusChange={handleStatusChange}
                    onNoteChange={handleNoteChange}
                    onAISuggest={generateAISuggestion}
                  />
                ))}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={attendanceData.length === 0 || isPending || isFetchingAttendance}
                className="min-w-[120px] gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : attendanceMode === 'edit' ? (
                  'Update Attendance'
                ) : (
                  'Save Attendance'
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {attendanceMode === 'edit' ? 'Confirm Update' : 'Confirm Submission'}
            </DialogTitle>
            <DialogDescription>
              {attendanceMode === 'edit'
                ? 'This will overwrite the existing attendance records for this date.'
                : 'Please review the attendance summary before final submission.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{format(selectedDate, 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{grades.find((g) => g.id === selectedGrade)?.grade}</p>
                <p className="text-sm text-muted-foreground">{sections.find((s) => s.id === selectedSection)?.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span className="text-sm font-medium">Present Students</span>
                <Badge variant="secondary" className="bg-green-200 text-green-500">{attendanceStats.present}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <span className="text-sm font-medium">Absent Students</span>
                <Badge variant="secondary" className="bg-red-200 text-red-500">{attendanceStats.absent}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <span className="text-sm font-medium">Late Students</span>
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-500">{attendanceStats.late}</Badge>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Total:</strong> {attendanceData.length} students •{' '}
                <strong>Attendance Rate:</strong> {attendanceStats.percentage}%
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isPending}>
              Go Back
            </Button>
            <Button onClick={confirmSubmit} disabled={isPending} className="min-w-[120px] gap-2">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm & Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Warning Dialog */}
      <AlertDialog open={showCancelWarning} onOpenChange={setShowCancelWarning}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Discard Changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved attendance marks. Leaving will discard all your selections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="sm:flex-1">Stay on Page</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="sm:flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
