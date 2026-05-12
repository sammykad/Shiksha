'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  CheckCircle,
  Eye,
  FileText,
  MoreHorizontal,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { deleteAttendance } from '@/app/actions';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { formatDateIN, formatTimeIN } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatus } from '@/generated/prisma/enums';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AttendanceExport } from './attendance-export';
import { Organization } from '@/types/attendance-export';
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
import { AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  note: string | null;
  recordedBy: string;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
  grade: {
    id: string;
    grade: string;
  };
  section: {
    id: string;
    name: string;
    gradeId: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    profileImage: string | null;
    section: { name: string } | null;
  };
}

interface AttendanceRecordsProps {
  records: AttendanceRecord[];
  organization?: Organization | null;
}

export function AttendanceTable({ records, organization }: AttendanceRecordsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'studentName' | 'grade' | 'status' | 'recordedBy';
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;

    return {
      total,
      present,
      absent,
      late,
      presentPercentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
    };
  }, [records]);

  // Sort records
  const sortedRecords = useMemo(() => {
    const recordsCopy = [...records];

    return recordsCopy.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'studentName':
          aValue = `${a.student.firstName} ${a.student.lastName}`.toLowerCase();
          bValue = `${b.student.firstName} ${b.student.lastName}`.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'grade':
          aValue = a.grade.grade.toLowerCase();
          bValue = b.grade.grade.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'recordedBy':
          aValue = a.recordedBy.toLowerCase();
          bValue = b.recordedBy.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [records, sortConfig]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(record => record.id));
    }
  };

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const confirmDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteAttendance([id]);
        toast.success('Attendance record deleted successfully!');
        setSelectedIds(prev => prev.filter(itemId => itemId !== id));
      } catch (error) {
        toast.error('Failed to delete attendance record');
      } finally {
        setDeleteId(null);
      }
    });
  };

  const confirmBulkDelete = () => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      try {
        await deleteAttendance(selectedIds);
        toast.success(
          `${selectedIds.length} attendance records deleted successfully!`
        );
        setSelectedIds([]);
      } catch (error) {
        toast.error('Failed to delete attendance records');
      } finally {
        setShowBulkDelete(false);
      }
    });
  };

  const toggleNoteExpansion = (id: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };


  if (records.length === 0) {
    return (
      <div className="flex justify-center items-center my-5 rounded-md border p-8">
        <EmptyState
          title="No Attendance Records"
          description="There are no attendance records matching your current filters. Start by taking attendance for your students."
          icons={[User, Calendar, FileText]}
          image="/EmptyState.png"
          hint="Make sure you have students enrolled before taking attendance. Try adjusting your filters if you're looking for specific records."
          action={{
            label: 'Take Attendance',
            href: '/dashboard/attendance/mark',
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Records</span>
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Attendance records loaded
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Present</span>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums text-emerald-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Students marked present
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Attendance Rate</span>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{stats.presentPercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.present + stats.late} of {stats.total} present or late
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">Absent</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg">
                <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Students marked absent
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Showing {records.length} records • {selectedIds.length} selected
                {records.length > 0 && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Note: Students may appear multiple times (one record per attendance date)
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <AttendanceExport
                records={records.map(r => ({
                  ...r,
                  name: `${r.student.firstName} ${r.student.lastName}`,
                  rollNumber: r.student.rollNumber,
                  grade: r.grade.grade,
                  section: r.section.name
                }))}
                organization={organization}
                title="Attendance Records List"
                filename="attendance-records"
              />
              {selectedIds.length > 0 && (
                <Button
                  onClick={() => setShowBulkDelete(true)}
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 p-3">
                    <Checkbox
                      checked={
                        records.length > 0 &&
                        selectedIds.length === records.length
                      }
                      onCheckedChange={toggleAllSelection}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('date')}
                    >
                      Date
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="ml-1 h-4 w-4" /> :
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('studentName')}
                    >
                      Student
                      {sortConfig.key === 'studentName' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="ml-1 h-4 w-4" /> :
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('grade')}
                    >
                      Grade/Section
                      {sortConfig.key === 'grade' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="ml-1 h-4 w-4" /> :
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortConfig.key === 'status' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="ml-1 h-4 w-4" /> :
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="p-3">Note</TableHead>
                  <TableHead className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('recordedBy')}
                    >
                      Recorded By
                      {sortConfig.key === 'recordedBy' && (
                        sortConfig.direction === 'asc' ?
                          <ChevronUp className="ml-1 h-4 w-4" /> :
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-20 p-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className={cn(
                      "group hover:bg-muted/50",
                      selectedIds.includes(record.id) && "bg-primary/5"
                    )}
                  >
                    <TableCell className="p-3">
                      <Checkbox
                        checked={selectedIds.includes(record.id)}
                        onCheckedChange={() => toggleSelection(record.id)}
                        aria-label={`Select ${record.student.firstName} ${record.student.lastName}`}
                      />
                    </TableCell>

                    <TableCell className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium whitespace-nowrap">
                          {formatDateIN(record.date)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeIN(record.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={record.student.profileImage || undefined} alt={`${record.student.firstName} ${record.student.lastName}`} />
                          <AvatarFallback className="text-xs font-medium">
                            {record.student.firstName[0]}{record.student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium capitalize text-foreground">
                            {record.student.firstName} {record.student.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-muted rounded">
                              #{record.student.rollNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">
                          Grade {record.grade.grade}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Sec: {record.section.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={record.status}
                            >
                              {record.status}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Marked on {formatDateIN(record.date)}</p>
                            <p className="text-xs text-muted-foreground">
                              Updated: {formatTimeIN(record.updatedAt)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="p-3 max-w-[200px]">
                      {record.note ? (
                        <div>
                          <div
                            className={cn(
                              "text-sm",
                              expandedNotes.has(record.id)
                                ? "line-clamp-none"
                                : "line-clamp-2"
                            )}
                          >
                            {record.note}
                          </div>
                          {record.note.length > 100 && (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-xs mt-1"
                              onClick={() => toggleNoteExpansion(record.id)}
                            >
                              {expandedNotes.has(record.id) ? 'Show less' : 'Show more'}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">-</span>
                      )}
                    </TableCell>

                    <TableCell className="p-3">
                      <div className="text-sm">
                        {record.recordedBy}
                      </div>
                    </TableCell>

                    <TableCell className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/students/${record.studentId}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <User className="h-4 w-4" />
                              View Student Profile
                            </Link>
                          </DropdownMenuItem>


                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => setDeleteId(record.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Attendance Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && confirmDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete Record'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Multiple Records
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} attendance records?
              This action will permanently remove these records from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : `Delete ${selectedIds.length} Records`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}