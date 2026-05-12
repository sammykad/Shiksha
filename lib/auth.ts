'use server';

import prisma from '@/lib/db';
import { getCurrentUserId } from './user';
import { getOrganizationId } from './organization';
import { cache } from 'react';


export type UserRole =
  | { role: 'STUDENT'; studentId: string, userId: string }
  | { role: 'TEACHER'; teacherId: string, userId: string }
  | { role: 'PARENT'; parentId: string, userId: string }
  | { role: 'ADMIN'; userId: string };

export async function getCurrentUserByRole(): Promise<UserRole> {
  const userId = await getCurrentUserId();
  const organizationId = await getOrganizationId();
  // await syncOrganizationUser(organizationId, orgRole, userId);

  // Run queries in parallel
  const [admin, student, teacher, parent] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, role: 'ADMIN', organizationId },
      select: { id: true },
    }),
    prisma.student.findFirst({
      where: { userId, organizationId },
      select: { id: true },
    }),
    prisma.teacher.findFirst({
      where: { userId, organizationId },
      select: { id: true },
    }),
    prisma.parent.findFirst({
      where: { userId },
      select: { id: true, }
    }),
  ]);

  console.log('User:', admin, teacher, student, parent);

  if (admin) return { role: 'ADMIN', userId };
  if (student) return { role: 'STUDENT', userId, studentId: student.id };
  if (teacher) return { role: 'TEACHER', userId, teacherId: teacher.id };
  if (parent) return { role: 'PARENT', userId, parentId: parent.id, };

  throw new Error(
    `No role found for user ${userId} in organization ${organizationId}`
  );
}

export const getUserRoleCached = cache(
  async (userId: string, organizationId: string) => {
    const [admin, student, teacher, parent] = await Promise.all([
      prisma.user.findFirst({
        where: { id: userId, role: 'ADMIN', organizationId },
        select: { id: true },
      }),
      prisma.student.findFirst({
        where: { userId, organizationId },
        select: { id: true },
      }),
      prisma.teacher.findFirst({
        where: { userId, organizationId },
        select: { id: true },
      }),
      prisma.parent.findFirst({
        where: { userId },
        select: { id: true },
      }),
    ])

    if (admin) return { role: 'ADMIN', userId }
    if (student) return { role: 'STUDENT', studentId: student.id }
    if (teacher) return { role: 'TEACHER', teacherId: teacher.id }
    if (parent) return { role: 'PARENT', parentId: parent.id }

    throw new Error('Role not found')
  }
)
