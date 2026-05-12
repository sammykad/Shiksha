import CreateNotice from '@/components/dashboard/notice/create-notice';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

export default async function CreateNoticePage() {
  const organizationId = await getOrganizationId();

  const grades = await prisma.grade.findMany({
    where: { organizationId },
    include: { section: { orderBy: { name: 'asc' } } },
    orderBy: { grade: 'asc' },
  });

  return <CreateNotice grades={grades} />;
}