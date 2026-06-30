import { cache } from 'react';
import { Prisma } from '@/generated/prisma/client';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { toISTDate } from '@/lib/utils';
import { addDays } from 'date-fns';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'all';

interface FilterAttendanceProps {
  search: string;
  sectionId?: string;
  status?: AttendanceStatus;
  gradeId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export const FilterAttendance = cache(async ({
  search,
  sectionId,
  status,
  gradeId,
  startDate,
  endDate,
  page,
  pageSize,
}: FilterAttendanceProps) => {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();

  // Convert dates to IST midnight for proper DB querying
  // startDate: beginning of day in IST
  // endDate: beginning of NEXT day in IST (exclusive upper bound)
  let dateFilter: Prisma.StudentAttendanceWhereInput['date'];

  if (startDate || endDate) {
    const gte = startDate ? toISTDate(startDate) : undefined;
    // For exclusive upper bound: if endDate is April 16, we want < April 17 00:00 IST
    const lt = endDate ? toISTDate(addDays(new Date(endDate), 1)) : undefined;

    dateFilter = {
      ...(gte && { gte }),
      ...(lt && { lt }),
    };
  }

  const whereClause: Prisma.StudentAttendanceWhereInput = {
    academicYearId,
    student: {
      organizationId,
      ...(gradeId && { gradeId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { rollNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    ...(sectionId && { sectionId }),
    ...(status && status !== 'all' && { status }),
    ...(dateFilter && { date: dateFilter }),
  };


  const totalCount = await prisma.studentAttendance.count({ where: whereClause });

  let safePage = 1;
  let safePageSize = 30;

  if (page && pageSize) {
    safePageSize = Math.min(Math.max(1, pageSize), 200);
    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
    safePage = Math.min(Math.max(1, page), totalPages);
  }

  const records = await prisma.studentAttendance.findMany({
    where: whereClause,
    skip: page && pageSize ? (safePage - 1) * safePageSize : undefined,
    take: page && pageSize ? safePageSize : undefined,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          profileImage: true,
          section: { select: { name: true } },
          grade: { select: { grade: true, id: true } },
        },
      },
      section: true,
    },
    orderBy: [{ date: 'desc' }, { id: 'asc' }],
  });

  const mapped = records.map((record) => ({
    ...record,
    grade: record.student.grade,
  }));

  if (page && pageSize) {
    return {
      records: mapped,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / safePageSize)),
      page: safePage,
      pageSize: safePageSize,
    };
  }
  return { records: mapped, totalCount };
});

