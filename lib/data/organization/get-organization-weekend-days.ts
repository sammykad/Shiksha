import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

export async function getOrganizationWeekendDays(): Promise<number[]> {
  const organizationId = await getOrganizationId();
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { weekendDays: true },
  });
  return organization?.weekendDays ?? [0, 6];
}
