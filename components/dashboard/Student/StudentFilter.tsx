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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

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

interface StudentFilterProps {
  organizationId: string;
  initialStudents: Student[];
  initialGradeId?: string;
  initialSectionId?: string;
  initialSearch?: string;
}

export default function StudentFilter({
  organizationId,
  initialStudents,
  initialGradeId = 'all',
  initialSectionId = 'all',
  initialSearch = '',
}: StudentFilterProps) {
  const [grades, setGrades] = useState<GradeAndSection[]>([]);
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  // Local component state instead of URL-synced state to prevent navigation-induced Suspense reloads
  const [selectedGrade, setGrade] = useState<string>(initialGradeId);
  const [selectedSection, setSection] = useState<string>(initialSectionId);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const isFirstLoadRef = useRef(true);


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

  // Fetch grades and sections only once
  useEffect(() => {
    let mounted = true;

    async function loadGrades() {
      try {
        const data = await fetchGradesAndSections(organizationId);
        if (mounted) {
          setGrades(data || []);
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

  // Reset section when grade changes
  useEffect(() => {
    setSection('all');
  }, [selectedGrade]);

  // Fetch students with debouncing
  const fetchStudents = useCallback(
    async (search: string, gradeId: string, sectionId: string) => {
      try {
        startTransition(async () => {
          // Avoid capturing stale closure by passing args through
          const data = await FilterStudents({
            search: search.trim(),
            gradeId,
            sectionId,
          });

          setStudents(data || []);
        });
      } catch (error) {
        console.error('Error fetching students:', error);
      }
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
    fetchStudents(searchQuery, selectedGrade, selectedSection);
  }, [selectedGrade, selectedSection, searchQuery, fetchStudents]);

  const resetFilters = () => {
    setGrade('all');
    setSection('all');
    setSearchQuery('');
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
                setSearchQuery(e.target.value)
              }
              className="pl-9 pr-9 h-10 bg-background"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
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
              <Select value={selectedGrade} onValueChange={setGrade}>
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
                onValueChange={setSection}
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
                  <button onClick={() => setGrade('all')} className="ml-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {selectedSection !== 'all' && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  {selectedSectionName}
                  <button onClick={() => setSection('all')} className="ml-0.5 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <StudentsGridList
        students={students}
        hasActiveFilters={hasActiveFilters}
        totalStudentsCount={initialStudents.length}
      />
    </>
  );
}
