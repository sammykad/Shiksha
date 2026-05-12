
'use server';

import { getActiveAcademicYearId } from '@/lib/academicYear';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

export async function getAdminNotices() {
  const organizationId = await getOrganizationId();
  const academicYearId = await getActiveAcademicYearId();

  const notices = await prisma.notice.findMany({
    where: {
      academicYearId,
      organizationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10
  });
  return notices;
}
