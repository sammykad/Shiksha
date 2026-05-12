'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  GraduationCap,
  ChevronRight,
  Trash2,
  Settings2,
  Users,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AddGrade } from './AddGrade';
import { useTerminology } from '@/context/terminology';

export interface GradeWithCounts {
  id: string;
  grade: string;
  sectionCount: number;
  studentCount: number;
}

function GradeItem({
  grade,
  isActive,
  sectionLabel,
  studentLabel,
  onSelect,
  onManage,
  onDelete,
}: {
  grade: GradeWithCounts;
  isActive: boolean;
  sectionLabel: string;
  studentLabel: string;
  onSelect: () => void;
  onManage: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'w-full text-left rounded-lg border px-3.5 py-3.5 transition-all duration-150 group cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary/10 border-primary/25'
          : 'bg-background border-border hover:shadow-sm hover:border-border/80 hover:bg-accent/40'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'text-sm font-semibold truncate min-w-0 leading-snug',
                isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
              )}
              title={grade.grade}
            >
              {grade.grade}
            </span>
            {/* {isActive && (
              <Badge variant="outline" className="shrink-0 text-[10px] h-5 px-1.5 font-medium">
                Active
              </Badge>
            )} */}
          </div>
          <p className="text-xs text-muted-foreground leading-tight">
            {grade.sectionCount} {sectionLabel} · {grade.studentCount} {studentLabel}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={onManage}
              aria-label="Manage grade"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              aria-label="Delete grade"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground/40 group-hover:text-muted-foreground'
            )}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ searchTerm, label }: { searchTerm: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2.5">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <GraduationCap className="h-5 w-5 text-muted-foreground/60" />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">
          {searchTerm ? 'No results' : `No ${label} yet`}
        </p>
        {!searchTerm && (
          <p className="text-[11px] text-muted-foreground mt-0.5">Create one to get started</p>
        )}
      </div>
      {!searchTerm && <AddGrade />}
    </div>
  );
}

export function GradesSidebar({ grades }: { grades: GradeWithCounts[] }) {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const terms = useTerminology();

  const totalStudents = grades.reduce((acc, g) => acc + g.studentCount, 0);
  const filtered = grades.filter((g) =>
    g.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // md:h-full fills the aside — aside must have an explicit height (not max-h)
    <div className="flex flex-col rounded-xl border bg-card overflow-hidden md:h-full md:overflow-hidden">

      {/* Header — fixed, never scrolls */}
      <div className="relative shrink-0 px-4 pt-4 pb-3.5 border-b overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent pointer-events-none" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[15px] font-semibold text-foreground leading-tight">
                {terms.grades}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 ml-0.5">
              Manage {terms.grades.toLowerCase()} &amp; {terms.sections.toLowerCase()}
            </p>
          </div>
          <div className="relative shrink-0 mt-0.5">
            <AddGrade />
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">{grades.length}</span>
            <span className="text-xs text-muted-foreground">{terms.grades}</span>
          </div>
          <div className="w-px h-3.5 bg-border" />
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground tabular-nums">{totalStudents}</span>
            <span className="text-xs text-muted-foreground">{terms.students}</span>
          </div>
        </div>
      </div>

      {/* Search — fixed, never scrolls */}
      <div className="shrink-0 px-3 py-2.5 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={`Search ${terms.grades.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs bg-muted/50 border-0 focus-visible:ring-1 rounded-md"
          />
        </div>
      </div>

      {/* Grade list — ONLY this scrolls */}
      {/* Mobile: h-64 gives ScrollArea a concrete height to measure against    */}
      {/* md+:    flex-1 + min-h-0 takes remaining card space and clips overflow */}
      <div className="h-64 md:flex-1 md:min-h-0">
        <ScrollArea className="h-full scrollbar-hide">
          <div className="p-2 space-y-1.5">
            {filtered.length === 0 ? (
              <EmptyState searchTerm={search} label={terms.grades.toLowerCase()} />
            ) : (
              filtered.map((grade) => (
                <GradeItem
                  key={grade.id}
                  grade={grade}
                  isActive={pathname.includes(grade.id)}
                  sectionLabel={terms.sections.toLowerCase()}
                  studentLabel={terms.students.toLowerCase()}
                  onSelect={() => router.push(`/dashboard/grades/${grade.id}`)}
                  onManage={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/grades/${grade.id}`);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/grades/${grade.id}/delete`);
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}