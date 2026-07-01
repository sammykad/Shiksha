'use server';
import prisma from '@/lib/db';
import { OrganizationFormData } from '@/lib/schemas';
import { getCurrentUser } from '@/lib/user';

export async function updateOrganization({
  organizationId,
  data,
}: {
  organizationId: string;
  data: OrganizationFormData;
}) {
  const user = await getCurrentUser();
  if (user.organizationRole !== 'ADMIN') {
    throw new Error('Only admins can update organization settings.');
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      organizationType: data.organizationType,
      name: data.name,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      website: data.website,
      slug: data.slug,
      logo: data.logo,
      establishedYear: data.establishedYear ?? null,
      weekendDays: data.weekendDays,
    },
  });
}
