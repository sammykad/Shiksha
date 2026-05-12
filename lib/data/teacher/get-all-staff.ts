// lib/data/staff/get-all-staff.ts
'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

export async function getAllStaff() {
  const organizationId = await getOrganizationId();

  const staff = await prisma.user.findMany({
    where: {
      organizationId,
      role: {
        notIn: ['STUDENT', 'PARENT'],
      },
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      profileImage: true,
      createdAt: true,
      isActive: true,
      teacher: {
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
    orderBy: { createdAt: 'desc' },
  });

  return staff;
}