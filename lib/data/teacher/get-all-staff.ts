// lib/data/staff/get-all-staff.ts
'use server';

import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';

export async function getAllStaff() {
  const organizationId = await getOrganizationId();

  const staffRecords = await prisma.user.findMany({
    where: {
      isActive: true,
      memberships: {
        some: {
          organizationId,
          status: 'ACTIVE',
          role: {
            notIn: ['STUDENT', 'PARENT'],
          },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      createdAt: true,
      isActive: true,
      memberships: {
        where: {
          organizationId,
          status: 'ACTIVE',
        },
        select: {
          role: true,
        },
      },
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
    orderBy: { createdAt: 'desc' },
  });

  return staffRecords.map((u) => {
    const activeMembership = u.memberships[0];
    if (!activeMembership) {
      throw new Error(`Critical: User ${u.id} has no active membership in organization ${organizationId}`);
    }

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: activeMembership.role,
      profileImage: u.profileImage,
      createdAt: u.createdAt,
      isActive: u.isActive,
      teacher: u.teacher,
    };
  });
}