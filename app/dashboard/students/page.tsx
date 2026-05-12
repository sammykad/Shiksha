import { Button } from '@/components/ui/button';
import Link from 'next/link';
import StudentFilter from '@/components/dashboard/Student/StudentFilter';
import { searchParamsCache } from '@/lib/searchParams';
import { SearchParams } from 'nuqs';
import { getOrganization } from '@/lib/organization';
import FilterStudents from '@/lib/data/student/FilterStudents';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Students({ searchParams }: PageProps) {
  const [{ orgId, orgRole }, searchParamsParsed] = await Promise.all([
    getOrganization(),
    searchParamsCache.parse(searchParams),
  ]);

  const { search, sectionId, gradeId } = searchParamsParsed;

  const students = await FilterStudents({ search, gradeId, sectionId });

  if (orgRole === 'org:student' || orgRole === 'org:parent')
    redirect('/dashboard');

  return (
    <div className="px-2 space-y-3 pb-3">
      <PageHeader title="Manage students" description="Add, edit, and track student information"
        icon={Users}
        actions={<>
          <Link href="/dashboard/attendance/mark" className="flex-1 sm:flex-none">
            <Button type="button" className="w-full sm:w-auto" variant="outline">
              Take Attendance
            </Button>
          </Link>
          <Link href="/dashboard/students/create" className="flex-1 sm:flex-none">
            <Button
              type="button"
              className="w-full sm:w-auto"
            >
              Add New Student
            </Button>
          </Link>
        </>}
      />
      <StudentFilter
        organizationId={orgId}
        initialStudents={students}
        initialGradeId={gradeId || 'all'}
        initialSectionId={sectionId || 'all'}
        initialSearch={search || ''}
      />
    </div>
  );
}
