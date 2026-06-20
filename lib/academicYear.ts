'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';
import prisma from './prisma-base';
import { getOrganizationId } from './organization';

/**
 * Returns the current academic year ID, or null if none exists.
 * Never throws. Used by onboarding check.
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
 * Returns the current (isCurrent) academic year ID.
 * Throws if none exists — academic year is created during org setup.
 * Use this for writes: all new data goes to the current year.
 */
export const getCurrentAcademicYearId = cache(async (): Promise<string> => {
  const id = await getCurrentAcademicYearIdSafe();
  if (!id) throw new Error('No active academic year. Complete onboarding first.');
  return id;
});

/**
 * Returns the current academic year object, or null.
 */
export const getCurrentAcademicYear = cache(async () => {
  const organizationId = await getOrganizationId();
  return prisma.academicYear.findFirst({
    where: { organizationId, isCurrent: true },
  });
});

/**
 * Returns the active (user-selected viewing) academic year ID.
 * Checks a cookie first (set by year switcher), falls back to current year.
 * Throws if no valid year exists.
 * Use this for reads: scopes queries to the year the user is viewing.
 */
export const getActiveAcademicYearId = cache(async (): Promise<string> => {
  const cookieStore = await cookies();
  const cookieYearId = cookieStore.get('activeAcademicYearId')?.value;

  if (cookieYearId) {
    const organizationId = await getOrganizationId();
    const year = await prisma.academicYear.findFirst({
      where: { id: cookieYearId, organizationId },
      select: { id: true },
    });
    if (year) return cookieYearId;
  }

  return getCurrentAcademicYearId();
});

/**
 * Returns the active academic year object.
 */
export const getActiveAcademicYear = cache(async () => {
  const organizationId = await getOrganizationId();
  const activeYearId = await getActiveAcademicYearId();
  return prisma.academicYear.findFirst({
    where: { id: activeYearId, organizationId },
  });
});

/**
 * Persists the user's year selection in a cookie for 30 days.
 */
export async function setActiveAcademicYearId(id: string) {
  const cookieStore = await cookies();
  cookieStore.set('activeAcademicYearId', id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Returns all academic years for the organization, newest first.
 */
export const getAcademicYears = cache(async (organizationId: string) => {
  return prisma.academicYear.findMany({
    where: { organizationId },
    orderBy: { startDate: 'desc' },
  });
});

