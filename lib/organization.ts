'use server';

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma-base";
import { cache } from "react";

export const getOrganizationId = cache(async () => {
  const { orgId } = await auth();
  return orgId;
});

export async function getDatabaseOrganization(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      metadata: true,
      institutionId: true,
      contactEmail: true,
      contactPhone: true,
      website: true,
      organizationType: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      walletBalance: true,
      establishedYear: true,
    },
  });
  return organization;
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
