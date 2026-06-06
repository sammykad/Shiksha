import { IndianRupeeIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MonthlyFeeCollection } from '@/components/dashboard/Fees/MonthlyFeeCollection';
import FeeDistributionByCategory from '@/components/dashboard/Fees/FeeDistributionByCategory';
import AdminFeesSummaryCards from '@/components/dashboard/Fees/AdminFeesSummaryCards';
import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMonthlyFeeData } from '@/lib/data/fee/getMonthlyFeeData';
import { Skeleton } from '@/components/ui/skeleton';
import StudentPaymentHistoryTable from '@/components/dashboard/Fees/StudentPaymentHistoryTable';
import { getFeeRecords } from '@/lib/data/fee/get-all-students-fees';
import { DashboardCardSkeleton } from '@/components/skeletons/DashboardCardSkeleton';
// import PaymentReceivedAlert from '@/components/ui/payment-received-alert';
import { getFeeCategoryDistribution } from '@/lib/data/fee/get-fee-category-distribution';
import { PageHeader } from '@/components/ui/page-header';
import { getPdcCheques } from '@/lib/data/fee/resolvePdcCheque';
import { PdcChequesAdminView } from '@/components/dashboard/Fees/pdc-cheques-admin-view';
import { getCurrentUserByRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminFeeDashboard() {
  const currentUser = await getCurrentUserByRole();
  if (currentUser.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [data, feeCategories, feeRecords, pdcCheques] = await Promise.all([
    getMonthlyFeeData(),
    getFeeCategoryDistribution(),
    getFeeRecords(),
    getPdcCheques(),
  ]);

  return (
    <div className="space-y-8 px-2">
      <PageHeader
        title='Fee Management'
        description='Manage and track fee collection across all students'
        icon={IndianRupeeIcon}
        actions={<>
          {/* <Button
            variant="outline"
            className="w-full sm:w-auto cursor-not-allowed"
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            <span className="sm:inline">Export Data</span>
          </Button> */}
          <Link
            href="/dashboard/fees/admin/assign"
            className="w-full sm:w-auto"
            prefetch
          >
            <Button className="w-full sm:w-auto">
              <PlusIcon className="mr-2 h-4 w-4" />
              <span className="sm:inline">Assign Fees</span>
            </Button>
          </Link>
        </>} />

      {/* Summary Cards */}
      <Suspense fallback={<AdminFeesSummaryCardsSkeleton />}>
        <AdminFeesSummaryCards />
      </Suspense>

      {/* Charts and Analytics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-3">
        <Suspense fallback={<MonthlyFeeCollectionSkeleton />}>
          <MonthlyFeeCollection
            data={data}
            className='col-span-3 sm:col-span-2'
          />
        </Suspense>

        <Suspense fallback={<FeeDistributionByCategorySkeleton />}>
          <FeeDistributionByCategory data={feeCategories} className='col-span-3 sm:col-span-1' />
        </Suspense>
      </div>
      <PdcChequesAdminView cheques={pdcCheques} />

      <Suspense fallback={<StudentPaymentHistoryTableSkeleton />}>
        <StudentPaymentHistoryTable feeRecords={feeRecords} />
      </Suspense>

    </div>
  );
}

const MonthlyFeeCollectionSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-5 w-40 bg-muted rounded mb-1" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-[100px] bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      </div>

      <div className="flex justify-between border-b pb-4 h-[230px] items-end gap-1 md:gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-5 md:w-8 bg-muted rounded-t-md"
              style={{ height: `${40 + i * 5}px` }}
            />
            <div className="h-3 w-8 bg-muted rounded" />
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <div>
          <div className="h-4 w-24 bg-muted rounded mb-1" />
          <div className="h-6 w-28 bg-muted rounded" />
        </div>
        <div className="text-right">
          <div className="h-4 w-24 bg-muted rounded mb-1 ml-auto" />
          <div className="h-6 w-16 bg-muted rounded ml-auto" />
        </div>
      </div>
    </div>
  );
};

const StudentPaymentHistoryTableSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: 8 }).map((_, i) => (
              <th key={i} className="p-4">
                <Skeleton className="h-5 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 8 }).map((__, j) => (
                <td key={j} className="p-4">
                  <Skeleton className="h-5 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card>
);

const FeeDistributionByCategorySkeleton = () => {
  return (
    <>
      <Card className="p-0">
        <CardHeader>
          <CardTitle>
            <Skeleton className="w-full bg-gray-100 h-5 max-w-full mb-2" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="w-[30%] bg-gray-100 h-3 max-w-full mb-2" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="my-4">
              <div className="space-y-2 flex flex-col my-3">
                <span>
                  <Skeleton className="w-[120px] h-4 max-w-full" />
                </span>
                <span>
                  <Skeleton className="w-[624px]  h-4 max-w-full" />
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
};

const AdminFeesSummaryCardsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <DashboardCardSkeleton key={i} />
    ))}
  </div>
);
