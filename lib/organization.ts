'use server';

import { auth } from '@clerk/nextjs/server';
import { cache } from 'react';
import prisma from '@/lib/db';

export const getOrganizationId = cache(async () => {
  const { orgId } = await auth();
  if (!orgId) throw new Error('No organization ID found');
  return orgId;
});

export const getOrganization = cache(async () => {
  const { orgId, orgRole, orgSlug } = await auth();
  if (!orgId) throw new Error('No organization ID found');
  if (!orgRole) throw new Error('No organization role found');
  if (!orgSlug) throw new Error('No organization slug found');
  return {
    orgId,
    orgRole,
    orgSlug,
  };
});

export const getOrganizationUserRole = cache(async () => {
  const { orgRole } = await auth();
  if (!orgRole) throw new Error('No organization role found');
  return orgRole;
});

export async function getDatabaseOrganization(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      contactEmail: true,
      contactPhone: true,
      website: true,
      organizationType: true,
      plan: true,
      planStartedAt: true,
      planExpiresAt: true,
      maxStudents: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      isPaid: true,
      walletBalance: true,
      establishedYear: true
    }
  })
  return organization
}

export const getOrganizationType = cache(async (organizationId: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { organizationType: true },
  });
  return organization?.organizationType;
});


export const getNotificationVariables = cache(async (organizationId: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });
  if (!organization) {
    throw new Error("Organization not found");
  }
  return {
    organizationName: organization.name,
  };
});