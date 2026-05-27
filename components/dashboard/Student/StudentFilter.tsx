'use client';

import type React from 'react';

import {
  useEffect,
  useState,
  useCallback,
  useTransition,
  useMemo,
  useRef,
} from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Filter,
  Search,
  X,
  Users,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
// NOTE: Removed nuqs URL sync to avoid full RSC re-renders on each change
import { fetchGradesAndSections } from '@/app/actions';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FilterStudents from '@/lib/data/student/FilterStudents';
import StudentsGridList from '@/components/dashboard/Student/StudentsGridList';
import { cn, sortByNaturalText } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type GradeAndSection = {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
};

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string | null;
  rollNumber: string;
  phoneNumber: string;
  email: string;
  profileImage?: string | null;
  dateOfBirth: Date;
  grade: {
    id: string;
    grade: string;
  };
  section: {
    id: string;
    name: string;
  };
}

interface PaginatedStudentsResult {
  students: Student[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface StudentFilterProps {
  organizationId: string;
  initialResult: PaginatedStudentsResult;
  initialGradeId?: string;
  initialSectionId?: string;
  initialSearch?: string;
}

export default function StudentFilter({
  organizationId,
  initialResult,
  initialGradeId = 'all',
  initialSectionId = 'all',
  initialSearch = '',
}: StudentFilterProps) {
  const [grades, setGrades] = useState<GradeAndSection[]>([]);
  const [students, setStudents] = useState<Student[]>(initialResult.students);
  const [totalCount, setTotalCount] = useState(initialResult.totalCount);
  const [currentPage, setCurrentPage] = useState(initialResult.page);
  const [pageSize, setPageSize] = useState(initialResult.pageSize);
  const [totalPages, setTotalPages] = useState(initialResult.totalPages);

  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  // Local component state instead of URL-synced state to prevent navigation-induced Suspense reloads
  const [selectedGrade, setGrade] = useState<string>(initialGradeId);
  const [selectedSection, setSection] = useState<string>(initialSectionId);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const isFirstLoadRef = useRef(true);
  const latestRequestRef = useRef(0);


  // Memoize active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGrade !== 'all') count++;
    if (selectedSection !== 'all') count++;
    if (searchQuery) count++;
    return count;
  }, [selectedGrade, selectedSection, searchQuery]);

  // Memoize selected grade and section objects
  const selectedGradeObj = useMemo(
    () => grades.find((g) => g.id === selectedGrade),
    [grades, selectedGrade]
  );

  const selectedSectionObj = useMemo(
    () => selectedGradeObj?.sections.find((s) => s.id === selectedSection),
    [selectedGradeObj, selectedSection]
  );

  // Count active filters (memoized via activeFiltersCount)

  const selectedGradeName = selectedGradeObj?.name || 'All Grades';
  const selectedSectionName = selectedSectionObj?.name || 'All Sections';
  const startResult = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalCount);
  const visiblePages = useMemo<(number | 'start-ellipsis' | 'end-ellipsis')[]>(
    () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
      }

      const pages: (number | 'start-ellipsis' | 'end-ellipsis')[] = [1];
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('start-ellipsis');
      }

      for (let page = start; page <= end; page++) {
        pages.push(page);
      }

      if (end < totalPages - 1) {
        pages.push('end-ellipsis');
      }

      pages.push(totalPages);
      return pages;
    },
    [currentPage, totalPages]
  );

  // Fetch grades and sections only once
  useEffect(() => {
    let mounted = true;

    async function loadGrades() {
      try {
        const data = await fetchGradesAndSections(organizationId);
        if (mounted) {
          setGrades(
            sortByNaturalText(data || [], (grade) => grade.name).map(
              (grade) => ({
                ...grade,
                sections: sortByNaturalText(
                  grade.sections,
                  (section) => section.name
                ),
              })
            )
          );
        }
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    }

    loadGrades();

    return () => {
      mounted = false;
    };
  }, [organizationId]);

  // Keep any server-provided section filter on hydration, but clear invalid pairs.
  useEffect(() => {
    if (selectedGrade === 'all') {
      if (selectedSection !== 'all') {
        setSection('all');
      }
      return;
    }

    if (selectedSection === 'all' || grades.length === 0) return;

    const grade = grades.find((g) => g.id === selectedGrade);
    if (grade && !grade.sections.some((section) => section.id === selectedSection)) {
      setSection('all');
    }
  }, [grades, selectedGrade, selectedSection]);

  // Fetch students with debouncing
  const fetchStudents = useCallback(
    (
      search: string,
      gradeId: string,
      sectionId: string,
      page: number,
      size: number
    ) => {
      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;

      startTransition(async () => {
        try {
          const data = await FilterStudents({
            search: search.trim(),
            gradeId,
            sectionId,
            page,
            pageSize: size,
          });

          if (requestId !== latestRequestRef.current) return;

          setStudents(data.students || []);
          setTotalCount(data.totalCount);
          setCurrentPage(data.page);
          setPageSize(data.pageSize);
          setTotalPages(data.totalPages);
        } catch (error) {
          if (requestId === latestRequestRef.current) {
            console.error('Error fetching students:', error);
          }
        }
      });
    },
    []
  );

  // // Trigger fetch on filter changes
  // useEffect(() => {
  //   fetchStudents(searchQuery, selectedGrade, selectedSection);
  // }, [selectedGrade, selectedSection, searchQuery, fetchStudents]);

  // Fetch students on filter changes without updating the URL
  useEffect(() => {
    if (isFirstLoadRef.current) {
      // Skip first run to avoid showing loading state when initialStudents already rendered
      isFirstLoadRef.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      fetchStudents(
        searchQuery,
        selectedGrade,
        selectedSection,
        currentPage,
        pageSize
      );
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [
    selectedGrade,
    selectedSection,
    searchQuery,
    currentPage,
    pageSize,
    fetchStudents,
  ]);

  const resetFilters = () => {
    setGrade('all');
    setSection('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleGradeChange = (value: string) => {
    setGrade(value);
    setSection('all');
    setCurrentPage(1);
  };

  const handleSectionChange = (value: string) => {
    setSection(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const hasActiveFilters = activeFiltersCount > 0;
  const isFilteringComplete =
    selectedGrade !== 'all' && selectedSection !== 'all';

  return (
    <>
      <Card className="mb-6 border border-border shadow-sm">
        {/* Compact single-row header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50 shrink-0">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold text-sm truncate">Student Filters</span>
            {hasActiveFilters && (
              <Badge className="shrink-0 h-5 px-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-0">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-red-500"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant={showFilters ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 px-2.5 gap-1.5 sm:hidden"
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="text-xs">Filters</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Search — always visible */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 shrink-0">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              className="pl-9 pr-9 h-10 bg-background"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>

          {/* Collapsible filter panel — mobile: toggle, sm+: always shown */}
          <div className={cn(
            'grid gap-3 sm:grid-cols-2',
            !showFilters && 'hidden sm:grid'   // ← this is all you need
          )}>
            {/* Grade */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Grade Level
              </Label>
              <Select value={selectedGrade} onValueChange={handleGradeChange}>
                <SelectTrigger
                  className={cn(
                    'h-10 bg-background transition-colors',
                    selectedGrade !== 'all' && 'border-purple-400 dark:border-purple-600'
                  )}
                >
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Section
              </Label>
              <Select
                value={selectedSection}
                onValueChange={handleSectionChange}
                disabled={selectedGrade === 'all'}
              >
                <SelectTrigger
                  className={cn(
                    'h-10 bg-background transition-colors',
                    selectedSection !== 'all' && 'border-green-400 dark:border-green-600',
                    selectedGrade === 'all' && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <SelectValue
                    placeholder={selectedGrade === 'all' ? 'Select grade first' : 'All Sections'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {selectedGrade !== 'all' &&
                    grades
                      .find((g) => g.id === selectedGrade)
                      ?.sections.map((sec) => (
                        <SelectItem key={sec.id} value={sec.id}>
                          {sec.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedGrade !== 'all' && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                  {selectedGradeName}
                  <button onClick={() => handleGradeChange('all')} className="ml-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {selectedSection !== 'all' && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  {selectedSectionName}
                  <button onClick={() => handleSectionChange('all')} className="ml-0.5 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                  "{searchQuery}"
                  <button onClick={() => handleSearchChange('')} className="ml-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {isPending ? (
            'Updating students...'
          ) : totalCount > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{startResult}</span>
              {' - '}
              <span className="font-medium text-foreground">{endResult}</span>
              {' of '}
              <span className="font-medium text-foreground">{totalCount}</span>
              {' students'}
            </>
          ) : (
            'No students to show'
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
            disabled={isPending}
          >
            <SelectTrigger className="h-9 w-[84px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[24, 48, 96].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={cn(isPending && 'pointer-events-none opacity-60')}>
        <StudentsGridList
          students={students}
          hasActiveFilters={hasActiveFilters}
          totalStudentsCount={totalCount}
        />
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1 && !isPending) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  className={cn(
                    (currentPage <= 1 || isPending) &&
                      'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
              {visiblePages.map((page) =>
                typeof page === 'number' ? (
                  <PaginationItem key={page} className="hidden sm:list-item">
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        if (!isPending) {
                          handlePageChange(page);
                        }
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page} className="hidden sm:list-item">
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              )}
              <PaginationItem className="sm:hidden">
                <span className="flex h-9 items-center px-3 text-sm font-medium">
                  {currentPage}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages && !isPending) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  className={cn(
                    (currentPage >= totalPages || isPending) &&
                      'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
