'use client';
import { useState } from 'react';
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
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  TriangleAlert,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { SectionWiseAttendanceViewModal } from './section-wise-attendance-modal';
import { formatInIST } from '@/lib/utils';
import { AttendanceExport } from './attendance-export';
import { Organization } from '@/types/attendance-export';
import { SectionAttendanceDetails } from '@/types/attendance-analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SectionWiseAttendanceTableProps {
  sections: SectionAttendanceDetails[];
  date: Date;
  organization?: Organization | null;
}

export function SectionWiseAttendanceTable({
  sections,
  date = new Date(),
  organization,
}: SectionWiseAttendanceTableProps) {
  const [sortField, setSortField] =
    useState<keyof SectionAttendanceDetails>('section');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  // Get unique grades for filter
  const grades = Array.from(new Set(sections.map((section) => section.grade)));

  // Handle sort
  const handleSort = (field: keyof SectionAttendanceDetails) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort sections
  const filteredSections = sections.filter((section) => {
    if (filterStatus !== 'all' && section.status !== filterStatus) return false;
    if (filterGrade !== 'all' && section.grade !== filterGrade) return false;
    return true;
  });

  const sortedSections = [...filteredSections].sort((a, b) => {
    if (
      sortField === 'percentage' ||
      sortField === 'studentsPresent' ||
      sortField === 'totalStudents'
    ) {
      return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }

    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  // Format date
  const formattedDate = formatInIST(date, 'EEEE, MMMM dd, yyyy');

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  // Sort indicator component
  const SortIndicator = ({
    field,
  }: {
    field: keyof SectionAttendanceDetails;
  }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] =
    useState<SectionAttendanceDetails | null>(null);

  return (
    <Card>
      <CardHeader className="pb-4 p-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Section Attendance</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <AttendanceExport
              records={sections.flatMap(s => s.students.map(st => ({
                ...st,
                date: s.date,
                grade: s.grade,
                section: s.section,
                recordedBy: s.reportedBy
              })))}
              organization={organization}
              title={`Section Attendance Summary - ${formattedDate}`}
              filename={`section-attendance-${formattedDate}`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort('section')}
                >
                  Section <SortIndicator field="section" />
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIndicator field="status" />
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap text-right"
                  onClick={() => handleSort('percentage')}
                >
                  Completion <SortIndicator field="percentage" />
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap text-right"
                  onClick={() => handleSort('studentsPresent')}
                >
                  Present/Total <SortIndicator field="studentsPresent" />
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sections.length > 0 ? (
                <>
                  {sortedSections.length > 0 ? (
                    sortedSections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {section.grade} - {section.section}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <StatusBadge status={section.status} />
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <span className="tabular-nums">{section.percentage}%</span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${section.percentage >= 80
                                  ? 'bg-emerald-500'
                                  : section.percentage >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                  }`}
                                style={{ width: `${section.percentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap tabular-nums">
                          {section.studentsPresent}/{section.totalStudents}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSection(section);
                              setModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No sections found matching the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TriangleAlert className="h-8 w-8 text-amber-500" />
                      <span>No sections found</span>
                      <Link
                        href="/dashboard/grades"
                        className="text-primary hover:underline"
                      >
                        Create a new section
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal integration */}
      {selectedSection && (
        <SectionWiseAttendanceViewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          sectionData={selectedSection}
        />
      )}
    </Card>
  );
}