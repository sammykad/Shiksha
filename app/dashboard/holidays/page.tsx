import HolidayManagement from '@/components/dashboard/holiday/holiday-management';
import { getOrganizationId } from '@/lib/organization';
import prisma from '@/lib/db';
import { getAcademicYearSummary } from '@/lib/data/holiday/get-academic-year-summary';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { getActiveAcademicYearId } from '@/lib/academicYear';

export default async function page() {
  const [organizationId, academicYearId] = await Promise.all([
    getOrganizationId(),
    getActiveAcademicYearId(),
  ]);

  // Run summary + holidays fetch in parallel (both depend on org+year IDs)
  const [summary, holidays] = await Promise.all([
    getAcademicYearSummary(),
    prisma.academicCalendar.findMany({
      where: {
        organizationId,
        academicYearId,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        startDate: true,
        endDate: true,
        type: true,
        reason: true,
        isRecurring: true,
        createdBy: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <HolidayManagement holidays={holidays} holidaysSummary={summary} />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
