import prisma from '@/lib/db';
import FeeAssignmentFilter from '@/components/dashboard/Fees/FeeAssignmentFilter';
import { getOrganizationId } from '@/lib/organization';
import FeeAssignmentDataTable from '@/components/dashboard/Fees/FeeAssignmentDataTable';
import { searchParamsCache } from '@/lib/searchParams';
import { SearchParams } from 'nuqs';
import FeeAssignmentPagination from '@/components/dashboard/Fees/FeeAssignmentPagination';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IndianRupee, PlusIcon } from 'lucide-react';
import { getFeeBalance } from '@/lib/data/fee/fee-balance';

interface FilterAssignFeesProps {
  search: string;
  sectionId?: string;
  gradeId?: string;
}
const FilterAssignFees = async ({
  search,
  sectionId,
  gradeId,
  pageIndex = 1,
  pageSize = 20,
}: FilterAssignFeesProps & { pageIndex?: number; pageSize?: number }) => {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();

  // Define the type for whereClause
  type WhereClause = {
    organizationId: string;
    OR?: Array<{
      firstName?: { contains: string; mode: 'insensitive' };
      lastName?: { contains: string; mode: 'insensitive' };
      rollNumber?: { contains: string; mode: 'insensitive' };
    }>;
    gradeId?: string;
    sectionId?: string;
  };

  //  Build the where clause
  const whereClause: WhereClause = {
    organizationId,
  };

  // Add search filter if provided
  if (search) {
    whereClause['OR'] = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { rollNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Add grade filter if provided and not 'all'
  if (gradeId && gradeId !== 'all') {
    whereClause['gradeId'] = gradeId;
  }

  // Add section filter if provided and not 'all'
  if (sectionId && sectionId !== 'all') {
    whereClause['sectionId'] = sectionId;
  }

  const [students, totalCount] = await Promise.all([
    prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        profileImage: true,
        organizationId: true,
        grade: {
          select: {
            id: true,
            grade: true,
          },
        },
        section: {
          select: {
            id: true,
            gradeId: true,
            organizationId: true,
            name: true,
          },
        },
        Fee: {
          where: {
            academicYearId,
          },
          select: {
            id: true,
            totalFee: true,
            paidAmount: true,
            pendingAmount: true,
            dueDate: true,
            status: true,
            feeCategory: true,
            payments: { select: { amount: true, status: true } },
          },
        },
      },
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
      orderBy: [
        { grade: { grade: 'asc' } },
        { section: { name: 'asc' } },
        { rollNumber: 'asc' },
      ],
    }),
    prisma.student.count({ where: whereClause }),
  ]);

  return {
    students: students.map((student) => ({
      ...student,
      Fee: student.Fee.map((fee) => {
        const balance = getFeeBalance(fee);
        return {
          ...fee,
          paidAmount: balance.paidAmount,
          pendingAmount: balance.dueAmount,
          status: balance.status,
        };
      }),
    })),
    totalCount,
  };
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AssignFees({ searchParams }: PageProps) {
  const organizationId = await getOrganizationId();
  const feeCategories = await prisma.feeCategory.findMany({
    where: {
      organizationId,
    },
  });

  const parsedParams = await searchParamsCache.parse(searchParams);

  const { search, sectionId, gradeId, pageIndex = 1, pageSize = 20 } = parsedParams;

  const { students, totalCount } = await FilterAssignFees({
    search,
    sectionId,
    gradeId,
    pageIndex,
    pageSize,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <main className="flex flex-1 flex-col gap-4 ">
      <PageHeader
        title='Assign Fees'
        description='Select students to assign fees'
        icon={IndianRupee}
        actions={
          <>
            <Link href="/dashboard/fees/admin/fee-categories">
              <Button className='w-full'>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </Link>
          </>
        } />
      <FeeAssignmentFilter organizationId={organizationId} />
      <FeeAssignmentDataTable
        students={students || []}
        feeCategories={feeCategories || []}
      />
      <FeeAssignmentPagination currentPage={pageIndex} totalPages={totalPages} />
    </main>
  );
}
