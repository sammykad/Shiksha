import { Suspense } from 'react';
import { ShieldAlert } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ComplaintManagement } from '@/components/dashboard/anonymousComplaints/manage/complaint-management';
import { getComplaintsWithFilters } from '@/lib/data/complaints/complaint-actions';
import { PageHeader } from '@/components/ui/page-header';

interface SearchParams {
  status?: string;
  severity?: string;
  category?: string;
  search?: string;
  id?: string;
  page?: string;
  sort?: string;
  order?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

async function ComplaintManagementContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    status,
    severity,
    category,
    search,
    id,
    page = '1',
    sort = 'submittedAt',
    order = 'desc',
  } = searchParams;

  const filters = {
    status: status || undefined,
    severity: severity || undefined,
    category: category || undefined,
    search: search || undefined,
    page: parseInt(page),
    sort,
    order: order as 'asc' | 'desc',
  };

  const complaintsData = await getComplaintsWithFilters(filters);

  return (
    <ComplaintManagement
      initialData={complaintsData}
      filters={filters}
      selectedComplaintId={id}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              {(i === 1 || i === 2) && <Skeleton className="h-1.5 w-full mt-3" />}
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <Skeleton className="h-10 flex-1" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-[140px]" />
                <Skeleton className="h-10 w-[140px]" />
                <Skeleton className="h-10 w-12" />
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ComplaintManagePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className='space-y-4 px-2'>
      <PageHeader 
        title="Anonymous Complaints" 
        description="Monitor and manage anonymous submissions with administrative oversight" 
        icon={ShieldAlert}
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <ComplaintManagementContent searchParams={resolvedSearchParams} />
      </Suspense>

    </div>
  );
}
