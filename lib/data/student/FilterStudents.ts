'use server';

import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

interface FilterStudentsProps {
  search?: string;
  gradeId?: string;
  sectionId?: string;
  page?: number;
  pageSize?: number;
}

export default async function FilterStudents({
  search = '',
  gradeId = 'all',
  sectionId = 'all',
  page = 1,
  pageSize = 24,
}: FilterStudentsProps) {
  const organizationId = await getOrganizationId();
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 96);

  const where: Prisma.StudentWhereInput = {
    organizationId,
  };

  const trimmedSearch = search.trim();
  if (trimmedSearch !== '') {
    where.AND = [
      {
        OR: [
          { firstName: { contains: trimmedSearch, mode: 'insensitive' } },
          { lastName: { contains: trimmedSearch, mode: 'insensitive' } },
          { fullName: { contains: trimmedSearch, mode: 'insensitive' } },
          { rollNumber: { contains: trimmedSearch, mode: 'insensitive' } },
          { email: { contains: trimmedSearch, mode: 'insensitive' } },
        ],
      },
    ];
  }

  if (gradeId !== 'all') {
    where.gradeId = gradeId;
  }

  if (sectionId !== 'all') {
    where.sectionId = sectionId;
  }

  try {
    const totalCount = await prisma.student.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
    const currentPage = Math.min(safePage, totalPages);
    const skip = (currentPage - 1) * safePageSize;

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        rollNumber: true,
        phoneNumber: true,
        email: true,
        profileImage: true,
        dateOfBirth: true,
        grade: {
          select: {
            id: true,
            grade: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { id: 'asc' }],
      skip,
      take: safePageSize,
    });

    return {
      students,
      totalCount,
      page: currentPage,
      pageSize: safePageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Error filtering students:', error);
    throw new Error('Failed to fetch students');
  }
}
