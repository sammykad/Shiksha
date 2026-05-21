// lib/data/staff/get-all-staff.ts
'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

export async function getAllStaff() {
  const organizationId = await getOrganizationId();

  const memberships = await prisma.membership.findMany({
    where: {
      organizationId,
      status: 'ACTIVE',
      role: { notIn: ['STUDENT', 'PARENT'] },
    },
    select: {
      role: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          createdAt: true,
          isActive: true,
          teacher: {
            where: { organizationId },
            select: {
              id: true,
              employeeCode: true,
              employmentStatus: true,
              isActive: true,
              profile: {
                select: {
                  qualification: true,
                  experienceInYears: true,
                  contactPhone: true,
                  specializedSubjects: true,
                },
              },
              teachingAssignment: {
                select: {
                  subject: { select: { name: true } },
                  grade: { select: { grade: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { user: { createdAt: 'desc' } },
  });

  return memberships.map((m) => ({
    id: m.user.id,
    firstName: m.user.firstName,
    lastName: m.user.lastName,
    email: m.user.email,
    role: m.role,
    profileImage: m.user.profileImage,
    createdAt: m.user.createdAt,
    isActive: m.user.isActive,
    teacher: m.user.teacher,
  }));
}