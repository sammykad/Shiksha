'use server';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from './prisma-base';
import { getOrganizationId } from './organization';

/**
 * Safe version - returns null if not found (no redirect)
 */
/**
 * Safe — returns null, never throws, never redirects.
 * Used by: getOnboardingStatus, getActiveAcademicYearId (cookie fallback)
 */
export const getCurrentAcademicYearIdSafe = cache(
  async (): Promise<string | null> => {
    try {
      const organizationId = await getOrganizationId();
      const currentYear = await prisma.academicYear.findFirst({
        where: { organizationId, isCurrent: true },
        select: { id: true },
      });
      return currentYear?.id ?? null;
    } catch {
      return null;
    }
  }
);
/**
 * Protected version - redirects to onboarding if not found
 */
export const getCurrentAcademicYearId = cache(async (): Promise<string> => {
  const id = await getCurrentAcademicYearIdSafe();
  if (!id) throw new Error('No active academic year. Complete onboarding first.');
  return id;
});

/**
 * Get current academic year object
 */
export const getCurrentAcademicYear = cache(async () => {
  const organizationId = await getOrganizationId();
  return prisma.academicYear.findFirst({
    where: { organizationId, isCurrent: true },
  });
});

/**
 * Get all academic years
 */
export const getAcademicYears = cache(async (organizationId: string) => {
  return prisma.academicYear.findMany({
    where: { organizationId },
    orderBy: { startDate: 'desc' },
  });
});

/**
 * Get active year ID (from cookie or fallback to current)
 */
export const getActiveAcademicYearId = cache(async (): Promise<string> => {
  const cookieStore = await cookies();
  const activeYearId = cookieStore.get('activeAcademicYearId')?.value;

  if (activeYearId) {
    // Verify it exists and belongs to org
    const organizationId = await getOrganizationId();
    const year = await prisma.academicYear.findFirst({
      where: { id: activeYearId, organizationId },
      select: { id: true },
    });
    if (year) return activeYearId;
  }

  // Fallback to current year
  const currentYearId = await getCurrentAcademicYearIdSafe();
  return currentYearId ?? '';
});

/**
 * Get active academic year object
 */
export const getActiveAcademicYear = cache(async () => {
  const organizationId = await getOrganizationId();
  const activeYearId = await getActiveAcademicYearId();
  return prisma.academicYear.findFirst({
    where: { id: activeYearId, organizationId },
  });
});

/**
 * Set active year in cookie
 */
export async function setActiveAcademicYearId(id: string) {
  const cookieStore = await cookies();
  cookieStore.set('activeAcademicYearId', id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}