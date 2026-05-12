'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getCurrentUserByRole } from '@/lib/auth';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

export async function getStudentNotices() {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();
  const { role } = await getCurrentUserByRole();

  const notices = await prisma.notice.findMany({
    where: {
      organizationId,
      academicYearId,
      status: { in: ['PUBLISHED', 'EXPIRED'] },
      targetRoles: {
        has: role,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10
  });
  return notices;
}
