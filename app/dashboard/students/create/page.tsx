import CreateStudentForm from '@/components/dashboard/Student/CreateStudentForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { getCurrentAcademicYearId } from '@/lib/academicYear';
import { sortByNaturalText } from '@/lib/utils';

// ✅ searchParams is a Promise in Next.js 15 — must be awaited
const CreateStudentPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>; // ← Promise, not plain object
}) => {
  const { leadId } = await searchParams; // ← await it

  let leadData = null;

  if (leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        studentName: true,
        parentName: true,
        phone: true,
        email: true,
        whatsappNumber: true,
      },
    });
    leadData = lead;
  }

  const organizationId = await getOrganizationId()
  const academicYearId = await getCurrentAcademicYearId();

  const rawGrades = await prisma.grade.findMany({
    where: { organizationId },
    select: {
      id: true,
      grade: true,
      section: { select: { id: true, name: true } },
    },
  });

  const grades = sortByNaturalText(rawGrades, (grade) => grade.grade).map(
    (grade) => ({
      ...grade,
      section: sortByNaturalText(grade.section, (section) => section.name),
    })
  );

  return (
    <Suspense fallback={<StudentProfileEditSkeleton />}>
      {/* ✅ Data is fetched here, not inside the Suspense child */}
      <CreateStudentForm leadData={leadData} leadId={leadId} organizationId={organizationId} academicYearId={academicYearId} grades={grades} />
    </Suspense>
  );
};

export default CreateStudentPage;

function StudentProfileEditSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
