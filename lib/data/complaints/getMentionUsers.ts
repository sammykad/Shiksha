// lib/data/complaints/getMentionUsers.ts
'use server';

import prisma from '@/lib/db';

export interface MentionUser {
  id: string;
  name: string;
  role: string;
  department?: string;
  email: string;
  profileImage?: string;
}

export async function getMentionUsers(
  organizationId: string,
  searchQuery?: string
): Promise<MentionUser[]> {
  const users = await prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(searchQuery && searchQuery.length >= 2 && {
        OR: [
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      profileImage: true,
      teacher: {
        select: {
          profile: {
            select: {
              qualification: true,
              specializedSubjects: true,
            },
          },
        },
      },
      student: {
        select: {
          grade: { select: { grade: true } },
          section: { select: { name: true } },
        },
      },
    },
    take: searchQuery ? 10 : 50,
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  });

  return users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role,
    department: getDepartmentInfo(user),
    email: user.email,
    profileImage: user.profileImage ?? undefined,
  }));
}



function getDepartmentInfo(user: {
  role: string;
  teacher?: {
    profile?: {
      specializedSubjects?: string[];
      qualification?: string | null;
    } | null;
  } | null;
  student?: {
    grade?: { grade?: string | number | null } | null;
    section?: { name?: string | null } | null;
  } | null;
}): string | undefined {
  // Teacher
  if (user.teacher?.profile) {
    const subjects = user.teacher.profile.specializedSubjects;
    if (subjects && subjects.length > 0) return subjects.join(', ');
    return user.teacher.profile.qualification ?? 'Teacher';
  }

  // Student — guard every level
  if (user.student) {
    const grade = user.student.grade?.grade;
    const section = user.student.section?.name;
    if (grade && section) return `Grade ${grade} - Section ${section}`;
    if (grade) return `Grade ${grade}`;
  }

  return user.role;
}