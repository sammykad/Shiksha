import { AttendanceTable } from '@/components/dashboard/StudentAttendance/attendance-table';
import AttendanceFilters from '@/components/dashboard/StudentAttendance/attendance-filter';
import DataTablePagination from '@/components/ui/data-table-pagination';
import { PageHeader } from '@/components/ui/page-header';
import { searchParamsCache } from '@/lib/searchParams';
import { SearchParams } from 'nuqs';
import { FilterAttendance } from '@/lib/data/attendance/FilterAttendance';
import { Button } from '@/components/ui/button';
import { PlusIcon, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { getDatabaseOrganization, getOrganizationId } from '@/lib/organization';
import { AttendanceExport } from '@/components/dashboard/StudentAttendance/attendance-export';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatsGridSkeleton } from '@/components/skeletons/stats-grid-skeleton';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { toISTDate } from '@/lib/utils';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'all';

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AttendancePage({ searchParams }: PageProps) {
  const organizationId = await getOrganizationId();

  return (
    <div className="px-2 space-y-6">
      <PageHeader
        title="Attendance History"
        description="Manage and track attendance across all students"
        icon={ClipboardCheck}
        actions={
          <>
            <Suspense fallback={null}>
              <ExportButton searchParams={searchParams} />
            </Suspense>
            <Button asChild size="sm" className="justify-center">
              <Link href={'/dashboard/attendance/mark'} prefetch>
                <PlusIcon className="mr-2 h-4 w-4" />
                Take Attendance
              </Link>
            </Button>
          </>
        }
      />
      <Card>
        <CardContent className="p-2 md:p-6 m-0">
          <AttendanceFilters organizationId={organizationId} />
        </CardContent>
      </Card>

      <Suspense fallback={
        <div className="space-y-6">
          <StatsGridSkeleton />
          <Card>
            <CardContent className="p-0">
              <TableSkeleton columns={8} rows={5} className="p-4" />
            </CardContent>
          </Card>
        </div>
      }>
        <AttendanceData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AttendanceData({ searchParams }: PageProps) {
  const organization = await getDatabaseOrganization(await getOrganizationId());

  const { search, sectionId, status, gradeId, endDate, startDate, pageIndex, pageSize } =
    await searchParamsCache.parse(searchParams);

  const records = await FilterAttendance({
    search,
    sectionId: sectionId === 'all' ? undefined : sectionId,
    gradeId: gradeId === 'all' ? undefined : gradeId,
    status: status as AttendanceStatus,
    startDate: startDate ? toISTDate(new Date(startDate)) : undefined,
    endDate: endDate ? toISTDate(new Date(endDate)) : undefined,
    page: pageIndex,
    pageSize,
  });

  return (
    <>
      <AttendanceTable records={records?.records || []} organization={organization} totalCount={records?.totalCount ?? 0} />
      <DataTablePagination currentPage={pageIndex} totalPages={records?.totalPages ?? 1} totalCount={records?.totalCount ?? 0} />
    </>
  );
}

async function ExportButton({ searchParams }: PageProps) {
  const organization = await getDatabaseOrganization(await getOrganizationId());
  const { status } = await searchParamsCache.parse(searchParams);

  const { search, sectionId, gradeId, endDate, startDate } =
    await searchParamsCache.parse(searchParams);

  const records = await FilterAttendance({
    search,
    sectionId: sectionId === 'all' ? undefined : sectionId,
    gradeId: gradeId === 'all' ? undefined : gradeId,
    status: status as AttendanceStatus,
    startDate: startDate ? toISTDate(new Date(startDate)) : undefined,
    endDate: endDate ? toISTDate(new Date(endDate)) : undefined,
  });

  return (
    <AttendanceExport
      records={records?.records || []}
      organization={organization}
      title="Attendance History Report"
      filename="attendance-history"
      filters={{
        status: status || 'all'
      }}
    />
  );
}


