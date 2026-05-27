'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Students {
  id: string;
  name: string;
  rollNumber: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
  note?: string;
}

interface SectionAttendanceDetails {
  id: string;
  section: string;
  grade: string;
  date: Date;
  reportedBy: string;
  status: 'completed' | 'in-progress' | 'pending';
  percentage: number;
  studentsPresent: number;
  totalStudents: number;
  students?: Students[];
}

interface SectionWiseAttendanceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionData: SectionAttendanceDetails;
}

export function SectionWiseAttendanceViewModal({
  isOpen,
  onClose,
  sectionData,
}: SectionWiseAttendanceViewModalProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!sectionData) {
    return null;
  }

  const {
    section,
    grade,
    date,
    reportedBy,
    status,
    percentage,
    studentsPresent,
    totalStudents,
    students = [], // Default to empty array to prevent undefined
  } = sectionData;

  // console.log('Section data (modal):', sectionData);
  // console.log('Student data (modal):', students);

  const router = useRouter();

  // console.log(sectionData, 'section data');

  // Format date
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate statistics
  const studentsAbsent = (students ?? []).filter(
    (student) => student.attendanceStatus === 'ABSENT'
  ).length;
  const studentsLate = (students ?? []).filter(
    (student) => student.attendanceStatus === 'LATE'
  ).length;
  const studentsNotRecorded = (students ?? []).filter(
    (student) => student.attendanceStatus === 'NOT_MARKED'
  ).length;

  // Status badge component
  const AttendanceStatusBadge = ({ status }: { status: string }) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'present':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Present
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Absent
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Late
          </Badge>
        );
      case 'not_marked':
      case 'not-recorded':
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Not Recorded
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Section status badge
  const SectionStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden sm:max-h-[90vh] sm:max-w-[800px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{section} Attendance</DialogTitle>
          <DialogDescription>
            {formattedDate} • Recorded by: {reportedBy || 'System'}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="grid w-full shrink-0 grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Student List</TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attendance Summary</h3>
              <SectionStatusBadge status={status} />
            </div>

            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Present</span>
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                      <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
                    {studentsPresent - studentsLate}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalStudents > 0
                      ? `${Math.round(
                        ((studentsPresent - studentsLate) / totalStudents) * 100
                      )}% of total`
                      : '0% of total'}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Late</span>
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
                    {studentsLate}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalStudents > 0
                      ? `${Math.round(
                        (studentsLate / totalStudents) * 100
                      )}% of total`
                      : '0% of total'}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Absent</span>
                    <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
                      <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
                    {studentsAbsent}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalStudents > 0
                      ? `${Math.round(
                        (studentsAbsent / totalStudents) * 100
                      )}% of total`
                      : '0% of total'}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Not Recorded</span>
                    <div className="p-2 bg-slate-100 dark:bg-slate-950/50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                  <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">
                    {studentsNotRecorded}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalStudents > 0
                      ? `${Math.round(
                        (studentsNotRecorded / totalStudents) * 100
                      )}% of total`
                      : '0% of total'}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-transparent pointer-events-none" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {totalStudents - studentsNotRecorded} of {totalStudents}{' '}
                    students
                  </span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setActiveTab('students')}
              >
                View Student List
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="students"
            className="mt-4 flex min-h-0 flex-1 flex-col gap-4"
          >
            <div className="flex shrink-0 items-center justify-between">
              <h3 className="text-lg font-medium">Student Attendance</h3>
              <div className="text-sm text-muted-foreground">
                Total: {totalStudents} students
              </div>
            </div>

            <ScrollArea className="h-[48vh] rounded-md border sm:h-[56vh]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.rollNumber}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <AttendanceStatusBadge
                            status={student.attendanceStatus}
                          />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {student.note || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No student data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex shrink-0 justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab('overview')}
              >
                Back to Overview
              </Button>
              <Button
                variant="default"
                onClick={() => router.push('/dashboard/attendance/mark')}
              >
                Update Attendance
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
