import { deleteSection } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import prisma from '@/lib/db';
import { DeleteSectionButton } from '@/lib/SubmitButton';
import { AlertTriangle, ArrowLeft, Trash2, Users, ClipboardList, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { getTerminology } from '@/lib/terminology';
import { getOrganizationId, getOrganizationType } from '@/lib/organization';

export default async function SectionDeleteRoute({
  params,
}: {
  params: Promise<{ gradeId: string; sectionId: string }>;
}) {
  const { gradeId, sectionId } = await params;

  const [section, organizationId] = await Promise.all([
    prisma.section.findUnique({
      where: { id: sectionId },
      select: {
        name: true,
        classTeacher: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            StudentAttendance: true,
          },
        },
      },
    }),
    getOrganizationId(),
  ]);

  const organizationType = await getOrganizationType(organizationId);
  const terms = getTerminology(organizationType);

  if (!section) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] p-6">
        <Card className="max-w-md border-border/50 shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {terms.section} Not Found
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1.5">
              The {terms.section.toLowerCase()} you're trying to delete doesn't
              exist or has already been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-6">
            <Link href={`/dashboard/grades/${gradeId}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to {terms.grade}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const totalStudents = section._count.students;
  const totalAttendanceRecords = section._count.StudentAttendance;
  const teacherName = section.classTeacher
    ? `${section.classTeacher.user.firstName} ${section.classTeacher.user.lastName}`
    : 'Not Assigned';

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-160px)] w-full p-4">
      <Card className="max-w-2xl w-full border-destructive/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="relative overflow-hidden border-b border-destructive/10 pb-6 pt-8 px-8">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative flex items-start gap-5">
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-2xl shrink-0">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mb-2">
                Delete {section.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                You are about to permanently delete this{' '}
                <span className="font-medium text-foreground uppercase tracking-wide text-[10px] px-1.5 py-0.5 rounded border border-border inline-flex mx-1 bg-muted">
                  {terms.section}
                </span>{' '}
                and its related academic records. This action cannot be reversed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="px-8 py-8 space-y-8">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Impact Assessment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-card border border-border/60 rounded-2xl shadow-sm group hover:border-destructive/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Users className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {terms.students}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {totalStudents}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Records
                  </p>
                </div>
              </div>

              {/* Dynamic Teacher Label Card */}
              <div className="p-5 bg-card border border-border/60 rounded-2xl shadow-sm group hover:border-destructive/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                    <UserCircle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {terms.classTeacher}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <p className="text-lg font-semibold tracking-tight text-foreground truncate">
                    {teacherName}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-card border border-border/60 rounded-2xl shadow-sm group hover:border-destructive/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-muted rounded-lg group-hover:bg-orange-500/10 transition-colors">
                    <ClipboardList className="h-3.5 w-3.5 text-muted-foreground group-hover:text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Attendance
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {totalAttendanceRecords}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Entries
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-destructive/5 border border-destructive/10 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-destructive mb-1.5">
                  Critical Warning
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Deleting this {terms.section.toLowerCase()} is only possible if it has no active students.
                  All associated academic history and attendance data will be permanently purged.
                  We highly recommend reassigning students to another {terms.section.toLowerCase()} before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>

        <CardFooter className="px-8 py-6 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3">
          <Link href={`/dashboard/grades/${gradeId}`} className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full">
              Cancel
            </Button>
          </Link>
          <form action={deleteSection} className="w-full sm:w-auto">
            <input type="hidden" name="sectionId" value={sectionId} />
            <DeleteSectionButton />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
