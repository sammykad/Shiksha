'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  Pause,
  Filter,
  ChevronDown,
  Users,
} from 'lucide-react';
import type { AssignmentStatus } from '@/generated/prisma/enums';
import {
  CreateAssignmentModal,
  type AcademicYear,
  type Teacher,
  type Subject,
  type Grade,
  type Section,
  type ExistingAssignment
} from '@/components/dashboard/teacher/CreateAssignmentModal';
import {
  createTeachingAssignment,
  deleteTeachingAssignment,
  updateTeachingAssignmentStatus,
} from '@/lib/data/teaching-assignment/createTeachingAssignment';
import { toast } from 'sonner';
import { useTerminology } from '@/context/terminology';

// import { updateAssignmentStatus, deleteTeachingAssignment } from "@/app/actions/teaching-assignments"

interface TeachingAssignment {
  id: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profileImage: string;
    };
    employeeCode: string | null;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  grade: {
    id: string;
    grade: string;
  };
  section: {
    id: string;
    name: string;
  };
  academicYear: {
    id: string;
    name: string;
  } | null;
}

interface FormDataProps {
  academicYears: AcademicYear[];
  teachers: Teacher[];
  subjects: Subject[];
  grades: Grade[];
  sections: Section[];
  existingAssignments: ExistingAssignment[];
}

interface TeachingAssignmentsTableProps {
  assignments: TeachingAssignment[];
  formData: FormDataProps;
}

const statusConfig = {
  PENDING: {
    color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    icon: Clock,
    label: 'Pending',
  },
  ASSIGNED: {
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    icon: CheckCircle,
    label: 'Assigned',
  },
  COMPLETED: {
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    icon: CheckCircle,
    label: 'Completed',
  },
  INACTIVE: {
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    icon: Pause,
    label: 'Inactive',
  },
};

export default function TeachingAssignmentsTable({
  assignments,
  formData,
}: TeachingAssignmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TeachingAssignment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const terms = useTerminology();

  const filteredAssignments = assignments.filter((assignment) => {
    const teacherName = `${assignment.teacher.user.firstName} ${assignment.teacher.user.lastName}`.toLowerCase();
    const matchesSearch =
      teacherName.includes(searchTerm.toLowerCase()) ||
      assignment.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || assignment.grade.id === gradeFilter;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (gradeFilter !== 'all' ? 1 : 0);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      const result = await deleteTeachingAssignment(id);
      if (result.success) {
        toast.success('Assignment deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete assignment');
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: AssignmentStatus) => {
    const result = await updateTeachingAssignmentStatus(id, status);
    if (result.success) {
      toast.success('Status updated successfully');
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teacher, subject or code..."
            className="pl-9 h-10 bg-muted/50 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {filtersOpen && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[130px] h-10">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {formData.grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="flex items-center gap-2 shrink-0 h-10 px-3"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Teacher</TableHead>
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="font-semibold">Grade & Section</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 opacity-20" />
                    <p>No assignments found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map((assignment) => {
                const status = statusConfig[assignment.status];
                const StatusIcon = status.icon;

                return (
                  <TableRow key={assignment.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage src={assignment.teacher.user.profileImage ?? undefined} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs">
                            {assignment.teacher.user.firstName[0]}
                            {assignment.teacher.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {assignment.teacher.user.firstName} {assignment.teacher.user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {assignment.teacher.employeeCode || assignment.teacher.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{assignment.subject.name}</span>
                        <span className="text-xs text-muted-foreground">{assignment.subject.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-medium">
                          {assignment.grade.grade}
                        </Badge>
                        <Badge variant="outline" className="font-medium">
                          Sec {assignment.section.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge className={`rounded-full px-2.5 py-0.5 font-medium cursor-pointer transition-colors ${status.color}`}>
                            <StatusIcon className="mr-1.5 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-32">
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleStatusUpdate(assignment.id, key as AssignmentStatus)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <config.icon className="h-3.5 w-3.5" />
                              {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit Assignment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer focus:text-destructive"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          {selectedAssignment && (
            <CreateAssignmentModal
              academicYears={formData.academicYears}
              teachers={formData.teachers}
              subjects={formData.subjects}
              grades={formData.grades}
              sections={formData.sections}
              existingAssignments={formData.existingAssignments}
              onSubmit={createTeachingAssignment}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
