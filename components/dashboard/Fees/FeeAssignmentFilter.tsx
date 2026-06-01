'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { parseAsInteger, useQueryState } from 'nuqs';
import { fetchGradesAndSections } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByNaturalText } from '@/lib/utils';

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
import { useTerminology } from '@/context/terminology';

const FeeAssignmentFilter = ({ organizationId }: AttendanceFiltersProps) => {
  const [grades, setGrades] = useState<GradeAndSection[]>([]);
  const terms = useTerminology();

  const [selectedGrade, setSelectedGrade] = useQueryState('gradeId', {
    defaultValue: 'all',
    shallow: false,
  });
  const [selectedSection, setSelectedSection] = useQueryState('sectionId', {
    defaultValue: 'all',
    shallow: false,
  });

  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
    shallow: false,
  });
  const [, setPageIndex] = useQueryState('pageIndex', {
    ...parseAsInteger.withDefault(1),
    shallow: false,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch === searchQuery) {
        return;
      }

      setSearchQuery(debouncedSearch);
      setPageIndex(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, searchQuery, setPageIndex, setSearchQuery]);

  useEffect(() => {
    async function loadGrades() {
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
      // console.log('data', data);
      // console.log('grades', grades);
    }
    loadGrades();
  }, [organizationId]);

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
    setSelectedSection('all');
    setPageIndex(1);
  };

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    setPageIndex(1);
  };

  return (
    <Card>
      <CardContent>
        <div className="w-full space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Search by name or roll no..."
              className="pl-8"
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="grade">{terms.grade}</Label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger id="grade">
                <SelectValue placeholder={`Select ${terms.grade}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {terms.grades}</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">{terms.section}</Label>
            <Select value={selectedSection} onValueChange={handleSectionChange}>
              <SelectTrigger id="section">
                <SelectValue placeholder={`Select ${terms.section.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {terms.sections}</SelectItem>
                {grades
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
      </CardContent>
    </Card>
  );
};

export default FeeAssignmentFilter;
