'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn, sortByNaturalText } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useQueryState } from 'nuqs';
import { fetchGradesAndSections } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
import { format, isValid } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

type GradeAndSection = {
  id: string;
  name: string;
  sections: Section[];
};

type Section = {
  id: string;
  name: string;
};

interface AttendanceFiltersProps {
  organizationId: string;
}

export default function AttendanceFilters({
  organizationId,
}: AttendanceFiltersProps) {
  const [grades, setGrades] = useState<GradeAndSection[]>([]);

  const [selectedGrade, setGrade] = useQueryState('gradeId', {
    defaultValue: 'all',
    shallow: false,
  });
  const [selectedSection, setSection] = useQueryState('sectionId', {
    defaultValue: 'all',
    shallow: false,
  });
  const [status, setStatus] = useQueryState('status', {
    defaultValue: 'all',
    shallow: false,
  });
  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
    shallow: false,
  });
  const [startDateStr, setStartDate] = useQueryState('startDate', {
    defaultValue: '',
    shallow: false,
  });
  const [endDateStr, setEndDate] = useQueryState('endDate', {
    defaultValue: '',
    shallow: false,
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        const data = await fetchGradesAndSections(organizationId);
        setGrades(
          sortByNaturalText(data || [], (grade) => grade.name).map((grade) => ({
            ...grade,
            sections: sortByNaturalText(
              grade.sections,
              (section) => section.name
            ),
          }))
        );
      } catch (error) {
        console.error('Failed to load grades and sections:', error);
      }
    };
    loadGrades();
  }, [organizationId]);

  useEffect(() => {
    if (selectedGrade !== 'all') {
      const currentGrade = grades.find((g) => g.id === selectedGrade);
      if (
        currentGrade &&
        !currentGrade.sections.some((s) => s.id === selectedSection)
      ) {
        setSection('all');
      }
    }
  }, [selectedGrade, grades]);

  useEffect(() => {
    if (startDateStr && endDateStr) {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      if (isValid(start) && isValid(end)) {
        setDateRange({ from: start, to: end });
      }
    } else {
      setDateRange(undefined);
    }
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, setSearchQuery]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-medium">Student</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number"
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="pl-8"
            />
            {debouncedSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1.5 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setDebouncedSearch('');
                  setSearchQuery('');
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Attendance Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PRESENT">Present</SelectItem>
              <SelectItem value="ABSENT">Absent</SelectItem>
              <SelectItem value="LATE">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Select value={selectedGrade} onValueChange={setGrade}>
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select Grade" />
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

        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Select
            value={selectedSection}
            onValueChange={setSection}
            disabled={selectedGrade === 'all'}
          >
            <SelectTrigger id="section">
              <SelectValue
                placeholder={
                  selectedGrade === 'all'
                    ? 'Select grade first'
                    : 'Select section'
                }
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

        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.from) {
                    setStartDate(formatInTimeZone(range.from, 'Asia/Kolkata', 'yyyy-MM-dd'));
                  } else {
                    setStartDate('');
                  }
                  if (range?.to) {
                    setEndDate(formatInTimeZone(range.to, 'Asia/Kolkata', 'yyyy-MM-dd'));
                  } else {
                    setEndDate('');
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedGrade !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Grade: {grades.find((g) => g.id === selectedGrade)?.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => { setGrade('all'); setSection('all'); }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove grade filter</span>
              </Button>
            </Badge>
          )}

          {selectedSection !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Section:{' '}
              {
                grades
                  .find((g) => g.id === selectedGrade)
                  ?.sections.find((s) => s.id === selectedSection)?.name
              }
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setSection('all')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove section filter</span>
              </Button>
            </Badge>
          )}

          {status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {status.charAt(0) + status.slice(1).toLowerCase()}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setStatus('all')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove status filter</span>
              </Button>
            </Badge>
          )}

          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery.length > 15 ? `${searchQuery.substring(0, 15)}...` : searchQuery}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove search filter</span>
              </Button>
            </Badge>
          )}

          {startDateStr && endDateStr && (
            <Badge variant="secondary" className="gap-1">
              Date: {formatInTimeZone(new Date(startDateStr), 'Asia/Kolkata', 'MMM d')} -{' '}
              {formatInTimeZone(new Date(endDateStr), 'Asia/Kolkata', 'MMM d')}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => { setStartDate(''); setEndDate(''); setDateRange(undefined); }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove date filter</span>
              </Button>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
