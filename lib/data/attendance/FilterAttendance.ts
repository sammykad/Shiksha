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
}

export const FilterAttendance = cache(async ({
  search,
  sectionId,
  status,
  gradeId,
  startDate,
  endDate,
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


  const records = await prisma.studentAttendance.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rollNumber: true,
          profileImage: true,
          section: {
            select: { name: true },
          },
          grade: {
            select: {
              grade: true,
              id: true,
            },
          },
        },
      },
      section: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
  return records.map((record) => ({
    ...record,
    grade: record.student.grade,
  }));
});

