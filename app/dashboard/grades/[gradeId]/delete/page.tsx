import { deleteGrade } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeleteGradeButton } from '@/lib/SubmitButton';
import { AlertTriangle, ArrowLeft, Trash2, Layers, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getTerminology } from '@/lib/terminology';

export default async function DeleteGradePage({
  params,
}: {
  params: Promise<{ gradeId: string }>;
}) {
  const { gradeId } = await params;
  const orgId = await getOrganizationId();

  // Fetch organization type for terminology
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { organizationType: true },
  });

  const terms = getTerminology(organization?.organizationType);

  // Fetch grade details for better UX
  const grade = await prisma.grade.findUnique({
    where: { id: gradeId },
    select: {
      id: true,
      grade: true,
      section: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { students: true }, // Count students per section
          },
        },
      },
    },
  });

  if (!grade) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">{terms.grade} Not Found</CardTitle>
            <CardDescription>
              The {terms.grade.toLowerCase()} you're trying to delete doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/dashboard/grades">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {terms.grades}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const totalStudents = grade.section.reduce(
    (sum, section) => sum + section._count.students,
    0
  );

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-160px)] w-full p-4">
      <Card className="max-w-xl w-full border-destructive/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="relative overflow-hidden border-b border-destructive/10 pb-6 pt-8 px-8">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative flex items-start gap-5">
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-2xl shrink-0">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mb-2">
                Delete {grade.grade}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                You are about to permanently delete this{' '}
                <span className="font-medium text-foreground uppercase tracking-wide text-[10px] px-1.5 py-0.5 rounded border border-border inline-flex mx-1 bg-muted">
                  {terms.grade}
                </span>{' '}
                and its entire structure. This action cannot be reversed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="px-8 py-8 space-y-8">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Impact Assessment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-card border border-border/60 rounded-2xl shadow-sm group hover:border-destructive/20 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {terms.sections}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {grade.section.length}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Batches
                  </p>
                </div>
              </div>

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
                  Deleting this {terms.grade.toLowerCase()} will automatically remove all associated {terms.sections.toLowerCase()}.
                  This is only possible if no active students are currently assigned to this {terms.grade.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <CardFooter className="px-8 py-6 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3">
          <Link href="/dashboard/grades" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full">
              Cancel
            </Button>
          </Link>
          <form action={deleteGrade} className="w-full sm:w-auto">
            <input type="hidden" name="gradeId" value={gradeId} />
            <DeleteGradeButton />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
