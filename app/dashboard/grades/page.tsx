import { GraduationCap, BookOpen, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import prisma from '@/lib/db';
import { getOrganizationId, getOrganizationType } from '@/lib/organization';
import { getTerminology } from '@/lib/terminology';
import { AddGrade } from '@/components/dashboard/class-management/AddGrade';

export default async function GradesPage() {
  const organizationId = await getOrganizationId();
  const organizationType = await getOrganizationType(organizationId);
  const terms = getTerminology(organizationType);

  const grades = await prisma.grade.findMany({
    where: { organizationId },
    select: {
      id: true,
      section: {
        select: { _count: { select: { students: true } } },
      },
    },
  });

  const totalSections = grades.reduce((acc, g) => acc + g.section.length, 0);
  const totalStudents = grades.reduce(
    (acc, g) =>
      acc + g.section.reduce((s, sec) => s + sec._count.students, 0),
    0
  );

  // ── Empty state ────────────────────────────────────────────────────────────
  if (grades.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={terms.grades}
          description={`Manage your ${terms.grades.toLowerCase()} and ${terms.sections.toLowerCase()}`}
          icon={GraduationCap}
          actions={<AddGrade />}
        />

        <Card className="overflow-hidden border-dashed">
          <div className="flex flex-col items-center justify-center py-24 text-center px-8 gap-5 bg-gradient-to-b from-primary/[0.03] to-transparent">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm relative">
              <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
              <GraduationCap className="h-10 w-10 text-primary relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Create your first {terms.grade.toLowerCase()}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Organize your students into classes and {terms.sections.toLowerCase()}.
                Once created, you can manage subjects and teaching assignments here.
              </p>
            </div>
            <div className="pt-2">
              <AddGrade />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Select prompt ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title={terms.grades}
        description={`${grades.length} ${terms.grades.toLowerCase()} · ${totalSections} ${terms.sections.toLowerCase()} · ${totalStudents} ${terms.students.toLowerCase()}`}
        icon={GraduationCap}
        actions={<AddGrade />}
      />

      {/* Select a grade prompt */}
      <Card className="overflow-hidden border-dashed">
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-6 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-1.5">
            <p className="text-lg font-semibold text-foreground">
              Select a {terms.grade.toLowerCase()} to get started
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Choose one from the sidebar to manage sections, students, and academic details.
            </p>
          </div>

          {/* Inline summary stats */}
          <div className="flex items-center gap-10 pt-6 border-t w-full max-w-lg justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary/60" />
                <span className="text-lg font-semibold text-foreground tabular-nums">
                  {grades.length}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                {terms.grades}
              </span>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary/60" />
                <span className="text-lg font-semibold text-foreground tabular-nums">
                  {totalSections}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                {terms.sections}
              </span>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary/60" />
                <span className="text-lg font-semibold text-foreground tabular-nums">
                  {totalStudents}
                </span>
              </div>
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                {terms.students}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
