import { Trash2, Users, GraduationCap, UserCheck, BookOpen, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import prisma from '@/lib/db';
import { AddSection } from '@/components/dashboard/class-management/AddSection';
import { ManageClassTeacher } from '@/components/dashboard/class-management/ManageClassTeacher';
import { getAvailableTeachers } from '@/lib/data/class-management/ClassTeacherManagement';
import { getTerminology } from '@/lib/terminology';
import { getOrganizationId, getOrganizationType } from '@/lib/organization';

async function getGradeWithSections(gradeId: string) {
  return prisma.grade.findUnique({
    where: { id: gradeId },
    include: {
      section: {
        include: {
          students: { select: { id: true } },
          classTeacher: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
  });
}

export default async function GradePage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;

  const [grade, teachersResponse, organizationId] = await Promise.all([
    getGradeWithSections(gradeId),
    getAvailableTeachers(''),
    getOrganizationId(),
  ]);

  const organizationType = await getOrganizationType(organizationId);
  const terms = getTerminology(organizationType);
  const teachers = teachersResponse.success ? teachersResponse.teachers : [];

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!grade) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={`${terms.grade} not found`}
          description="This grade may have been deleted or the link is incorrect"
          icon={GraduationCap}
          actions={
            <Link href="/dashboard/grades">
              <Button variant="outline" size="sm">
                Back to {terms.grades}
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const totalStudents = grade.section.reduce((sum, s) => sum + s.students.length, 0);
  const totalTeachers = grade.section.filter((s) => s.classTeacher).length;

  // ── Grade detail ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Page header */}
      <PageHeader
        title={grade.grade}
        description={`${grade.section.length} ${grade.section.length === 1 ? terms.section.toLowerCase() : terms.sections.toLowerCase()}`}
        icon={GraduationCap}
        actions={
          <>
            <Link href={`/dashboard/grades/${gradeId}/delete`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {terms.grade}
              </Button>
            </Link>
            <AddSection gradeId={gradeId} />
          </>
        }
      />

      {/* ── Summary stats strip — only when sections exist ─────────────────── */}
      {grade.section.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {terms.sections}
                </span>
                <div className="p-1.5 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                  <LayoutGrid className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-xl font-bold tabular-nums">
                {grade.section.length}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {terms.students}
                </span>
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                  <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-xl font-bold tabular-nums">{totalStudents}</div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Teachers
                </span>
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="text-xl font-bold tabular-nums">
                {totalTeachers}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {grade.section.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card min-h-[360px] px-8 py-16 text-center gap-4">
          <div className="w-14 h-14 rounded-xl border bg-muted flex items-center justify-center">
            <LayoutGrid className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              No {terms.sections.toLowerCase()} in {grade.grade} yet
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {terms.sections} help you organise {terms.students.toLowerCase()} and assign teachers within a {terms.grade.toLowerCase()}.
            </p>
          </div>
          <AddSection gradeId={gradeId} />
        </div>
      )}

      {/* ── Sections grid ──────────────────────────────────────────────────── */}
      {grade.section.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {grade.section.map((section) => (
            <Card
              key={section.id}
              className="group hover:shadow-sm transition-all duration-200 hover:border-border/80"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {/* Section label */}
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 font-normal mb-2"
                    >
                      {terms.section}
                    </Badge>
                    <CardTitle className="group-hover:text-primary transition-colors leading-relaxed">
                      {section.name}
                    </CardTitle>
                  </div>

                  {/* Delete — shows on hover */}
                  <Link
                    href={`/dashboard/grades/${gradeId}/${section.id}/delete`}
                    aria-label={`Delete ${section.name}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Stats */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium tabular-nums">
                      {section.students.length}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {section.students.length === 1
                        ? terms.student.toLowerCase()
                        : terms.students.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1.5 min-w-0">
                    <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {section.classTeacher
                        ? `${section.classTeacher.user.firstName} ${section.classTeacher.user.lastName}`
                        : `No ${terms.classTeacher.toLowerCase()}`}
                    </span>
                  </div>
                </div>

                {/* Class teacher action */}
                <div className="pt-1 border-t">
                  <ManageClassTeacher
                    sectionId={section.id}
                    currentTeacherId={section.classTeacherId}
                    teachers={teachers}
                    sectionName={section.name}
                    gradeName={grade.grade}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}