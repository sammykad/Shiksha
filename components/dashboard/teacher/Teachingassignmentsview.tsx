"use client";

import { useState, useMemo } from "react";
import { useAcademicYear } from "@/context/AcademicYearContext";
import { useTerminology } from "@/context/terminology";
import { BookOpen, ChevronDown, GraduationCap, Users, Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn, getInitials } from "@/lib/utils";
import { AssignmentStatus } from "@/generated/prisma/enums";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assignment {
  id: string;
  status: AssignmentStatus;
  teacher: { id: string; user: { firstName: string; lastName: string } };
  subject: { id: string; name: string; code: string };
  grade: { id: string; grade: string };
  section: { id: string; name: string; gradeId: string };
  academicYear: { id: string; name: string; isCurrent: boolean } | null;
}

interface Props {
  assignments: Assignment[];
}

// ─── Subject colour palette ───────────────────────────────────────────────────

const SUBJECT_COLOURS = [
  { bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  { bg: "bg-violet-100 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-950/50", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  { bg: "bg-amber-100 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  { bg: "bg-rose-100 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-950/50", text: "text-cyan-700 dark:text-cyan-400", dot: "bg-cyan-500" },
  { bg: "bg-orange-100 dark:bg-orange-950/50", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  { bg: "bg-teal-100 dark:bg-teal-950/50", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
];

function buildColourMap(assignments: Assignment[]) {
  const ids = Array.from(new Set(assignments.map((a) => a.subject.id)));
  return Object.fromEntries(ids.map((id, i) => [id, SUBJECT_COLOURS[i % SUBJECT_COLOURS.length]]));
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const map: Record<AssignmentStatus, { label: string; cls: string }> = {
    ASSIGNED: { label: "Assigned", cls: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" },
    PENDING: { label: "Pending", cls: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400" },
    COMPLETED: { label: "Done", cls: "bg-muted text-muted-foreground" },
    INACTIVE: { label: "Inactive", cls: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400" },
  };
  const { label, cls } = map[status];
  return (
    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md tracking-wide", cls)}>
      {label}
    </span>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  sectionName,
  assignments,
  colourMap,
}: {
  sectionName: string;
  assignments: Assignment[];
  colourMap: ReturnType<typeof buildColourMap>;
}) {
  const active = assignments.filter((a) => a.status !== "INACTIVE");
  const terminology = useTerminology();

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center text-[11px] font-bold leading-none">
            {sectionName}
          </div>
          <span className="text-sm font-semibold">{terminology.section} {sectionName}</span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {active.length} subject{active.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {active.length === 0 ? (
          <p className="px-4 py-5 text-center text-xs text-muted-foreground italic">No assignments yet</p>
        ) : (
          active.map((a) => {
            const colour = colourMap[a.subject.id] ?? SUBJECT_COLOURS[0];
            const teacherName = `${a.teacher.user.firstName} ${a.teacher.user.lastName}`.trim();
            return (
              <div
                key={a.id}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-muted/30 transition-colors group"
              >
                {/* Subject chip */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0",
                    colour.bg,
                    colour.text
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", colour.dot)} />
                  {a.subject.code}
                </span>

                {/* Subject name */}
                <span className="text-sm font-medium min-w-0 truncate flex-1">{a.subject.name}</span>

                {/* Teacher */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                    {getInitials(`${a.teacher.user.firstName} ${a.teacher.user.lastName}`)}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block max-w-[90px] truncate">
                    {teacherName}
                  </span>
                </div>

                {/* Status */}
                <div
                  className={cn(
                    "flex-shrink-0 transition-opacity",
                    a.status === "ASSIGNED" ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                  )}
                >
                  <StatusBadge status={a.status} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// ─── Grade group ──────────────────────────────────────────────────────────────

function GradeGroup({
  grade,
  sections,
  colourMap,
}: {
  grade: string;
  sections: { name: string; assignments: Assignment[] }[];
  colourMap: ReturnType<typeof buildColourMap>;
}) {
  const [open, setOpen] = useState(true);
  const terminology = useTerminology();
  const total = sections.reduce(
    (s, sec) => s + sec.assignments.filter((a) => a.status !== "INACTIVE").length,
    0
  );

  return (
    <div className="space-y-3">
      {/* Grade divider */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full text-left"
      >
        <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-bold tracking-tight">{terminology.grade} {grade}</span>
        <span className="text-xs text-muted-foreground font-normal">
          · {sections.length} {sections.length !== 1 ? terminology.sections.toLowerCase() : terminology.section.toLowerCase()}&nbsp;·&nbsp;{total} subject{total !== 1 ? "s" : ""}
        </span>
        <div className="flex-1 h-px bg-border" />
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            !open && "-rotate-90"
          )}
        />
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pl-6">
          {sections.map((sec) => (
            <SectionCard
              key={sec.name}
              sectionName={sec.name}
              assignments={sec.assignments}
              colourMap={colourMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip({ assignments }: { assignments: Assignment[] }) {
  const active = assignments.filter((a) => a.status !== "INACTIVE");
  const teachers = new Set(active.map((a) => a.teacher.id)).size;
  const subjects = new Set(active.map((a) => a.subject.id)).size;
  const sections = new Set(active.map((a) => a.section.id)).size;

  const terminology = useTerminology();

  const stats = [
    { label: "Assignments", value: active.length, icon: BookOpen, accent: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" },
    { label: terminology.sections, value: sections, icon: LayoutGrid, accent: "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400" },
    { label: "Subjects", value: subjects, icon: BookOpen, accent: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" },
    { label: "Teachers", value: teachers, icon: Users, accent: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, accent }) => (
        <Card key={label} className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <div className={cn("p-2 rounded-lg", accent)}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl md:text-lg lg:text-2xl font-bold tabular-nums">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TeachingAssignmentsView({ assignments }: Props) {
  const { viewingYear } = useAcademicYear();
  const [search, setSearch] = useState("");

  const colourMap = useMemo(() => buildColourMap(assignments), [assignments]);

  const yearFiltered = useMemo(
    () => (viewingYear ? assignments.filter((a) => a.academicYear?.id === viewingYear.id) : assignments),
    [assignments, viewingYear]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return yearFiltered;
    const q = search.toLowerCase();
    return yearFiltered.filter(
      (a) =>
        a.grade.grade.toLowerCase().includes(q) ||
        a.section.name.toLowerCase().includes(q) ||
        a.subject.name.toLowerCase().includes(q) ||
        a.subject.code.toLowerCase().includes(q) ||
        `${a.teacher.user.firstName} ${a.teacher.user.lastName}`.toLowerCase().includes(q)
    );
  }, [yearFiltered, search]);

  const grouped = useMemo(() => {
    const byGrade: Record<string, { grade: string; sections: Record<string, Assignment[]> }> = {};
    for (const a of filtered) {
      if (!byGrade[a.grade.id]) byGrade[a.grade.id] = { grade: a.grade.grade, sections: {} };
      const grp = byGrade[a.grade.id];
      if (!grp.sections[a.section.id]) grp.sections[a.section.id] = [];
      grp.sections[a.section.id].push(a);
    }
    return Object.values(byGrade)
      .sort((a, b) => {
        const na = parseInt(a.grade) || 0;
        const nb = parseInt(b.grade) || 0;
        return na !== nb ? na - nb : a.grade.localeCompare(b.grade);
      })
      .map((g) => ({
        grade: g.grade,
        sections: Object.entries(g.sections)
          .sort(([, aa], [, bb]) => aa[0].section.name.localeCompare(bb[0].section.name))
          .map(([, sa]) => ({ name: sa[0].section.name, assignments: sa })),
      }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${useTerminology().grade.toLowerCase()}, ${useTerminology().section.toLowerCase()}, subject, teacher…`}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Summary */}
      <SummaryStrip assignments={filtered} />

      {/* Grade groups */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No assignments found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Try adjusting your filters or create a new assignment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="space-y-8 p-4">
          {grouped.map((g) => (
            <GradeGroup key={g.grade} grade={g.grade} sections={g.sections} colourMap={colourMap} />
          ))}
        </Card>
      )}
    </div>
  );
}