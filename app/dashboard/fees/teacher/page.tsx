import { Suspense } from 'react';
import StudentPaymentHistoryTable from '@/components/dashboard/Fees/StudentPaymentHistoryTable';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { FeeStatsCardForTeacher } from '@/components/dashboard/teacher/FeeStatsCardForTeacher';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IndianRupeeIcon, PlusIcon } from 'lucide-react';
import { getAssignedStudentsFees } from '@/lib/data/fee/getAssignedStudentsFees';
import { getCurrentUserByRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';

export default async function TeacherFeesManagementDashboard() {
  const currentUser = await getCurrentUserByRole();

  if (currentUser.role !== 'TEACHER') {
    redirect('/dashboard'); // Better than throwing error
  }

  const teacherId = currentUser.teacherId;
  const feeRecords = await getAssignedStudentsFees(teacherId);

  return (
    <main className="px-2 space-y-3">
      <PageHeader
        title="Teacher Fees Dashboard"
        description="Manage your assigned student fees"
        icon={IndianRupeeIcon}
        actions={
          <>
            <Link href="/dashboard/fees/admin/assign" className='w-full sm:w-auto'>
              <Button size="sm" className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />Assign Fees
              </Button>
            </Link>
            <Link href="/dashboard/attendance/mark" className='w-full sm:w-auto'>
              <Button size="sm" variant="outline" className="w-full">Take Attendance</Button>
            </Link>
          </>
        }
      />

      <Suspense fallback={<FeeStatsCardSkeleton />}>
        <FeeStatsCardForTeacher />
      </Suspense>

      <Suspense fallback={<StudentPaymentHistoryTableSkeleton />}>
        <StudentPaymentHistoryTable feeRecords={feeRecords} />
      </Suspense>
    </main>
  );
}

const StudentPaymentHistoryTableSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-hidden">
        {/* Header skeleton */}
        <div className="flex items-center justify-between p-4 border-b">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Table skeleton */}
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const FeeStatsCardSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[60px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
