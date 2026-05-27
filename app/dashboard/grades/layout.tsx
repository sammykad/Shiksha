import { GradesSidebar } from '@/components/dashboard/class-management/grades-sidebar';
import { GradeListingSkeleton } from '@/components/dashboard/class-management/skeletons';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { cn, sortByNaturalText } from '@/lib/utils';
import type React from 'react';
import { Suspense } from 'react';

export default async function GradesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationId = await getOrganizationId();

  const grades = await prisma.grade.findMany({
    where: { organizationId },
    select: {
      id: true,
      grade: true,
      _count: { select: { section: true } },
      section: {
        select: { _count: { select: { students: true } } },
      },
    },
    orderBy: { grade: 'asc' },
  });

  const gradesWithCounts = sortByNaturalText(grades, (grade) => grade.grade).map((grade) => ({
    id: grade.id,
    grade: grade.grade,
    sectionCount: grade._count.section,
    studentCount: grade.section.reduce(
      (acc, s) => acc + s._count.students,
      0
    ),
  }));

  return (
    <div className={cn(
      "mx-2 flex flex-col gap-4 md:items-start",
      grades.length > 0
        ? "md:grid md:grid-cols-7 md:gap-5 lg:gap-6"
        : "max-w-5xl mx-auto w-full pt-4"
    )}>
      {/* Sidebar - Only show if there are grades */}
      {grades.length > 0 && (
        <aside className="md:col-span-3 md:sticky md:top-[120px] md:h-[calc(100vh-140px)] lg:col-span-2 w-full">
          <Suspense fallback={<GradeListingSkeleton />}>
            <GradesSidebar grades={gradesWithCounts} />
          </Suspense>
        </aside>
      )}

      {/* Main content */}
      <main className={cn(
        "min-h-[400px] w-full",
        grades.length > 0 ? "md:col-span-4 lg:col-span-5" : ""
      )}>
        {children}
      </main>
    </div>
  );
}
