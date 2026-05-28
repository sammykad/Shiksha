import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { ExamCreateForm } from '@/components/dashboard/exam/ExamCreateForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentAcademicYearId } from '@/lib/academicYear';
import { sortByNaturalText } from '@/lib/utils';

function FormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-24 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default async function ExamCreatePage() {
  const organizationId = await getOrganizationId();
  const academicYearId = await getCurrentAcademicYearId();
  const subjects = await prisma.subject.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  const teachersRaw = await prisma.teacher.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const teachers = teachersRaw.map((t) => ({
    id: t.id,
    firstName: t.user.firstName,
    lastName: t.user.lastName,
  }));

  const rawGradesWithSections = await prisma.grade.findMany({
    where: { organizationId },
    select: {
      id: true,
      grade: true,
      section: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const gradesWithSections = sortByNaturalText(
    rawGradesWithSections,
    (grade) => grade.grade
  ).map((grade) => ({
    ...grade,
    section: sortByNaturalText(grade.section, (section) => section.name),
  }));
  const examSession = await prisma.examSession.findMany({
    where: { organizationId, academicYearId },
  });

  const gradingScales = await prisma.gradingScale.findMany({
    where: { organizationId },
    include: { bands: true },
  });

  return (
    <Card className="px-2 border-none">
      <Card className="py-4 px-2 flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Create New Exam </CardTitle>
          <CardDescription className="text-sm">
            Create once, reuse often. Optimized for Admins and Teachers.
          </CardDescription>
        </div>
        <div className="flex justify-center items-center space-x-3">
          <Button asChild>
            <Link href={'/dashboard/exams/bulk'}> Create Bulk</Link>
          </Button>
        </div>
      </Card>
      <CardContent className="px-2 py-2 border-muted-foreground/10 ">
        <Suspense fallback={<FormSkeleton />}>
          <ExamCreateForm
            teachers={teachers}
            gradesWithSections={gradesWithSections}
            subjects={subjects}
            examSession={examSession}
            gradingScales={gradingScales}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
