import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import IdCardsPage from './IdCardsClient';

export const metadata = {
  title: 'ID Cards | Shiksha Cloud',
};

export default async function IdCardsRoute() {
  const { orgId, orgRole } = await auth();

  const [students, teachers, organization] = await Promise.all([
    prisma.student.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        rollNumber: true,
        grade: { select: { grade: true } },
        section: { select: { name: true } },
      },
      orderBy: [
        { grade: { grade: 'asc' } },
        { section: { name: 'asc' } },
        { rollNumber: 'asc' },
      ],
    }),
    orgRole === 'ADMIN'
      ? prisma.teacher.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          employeeCode: true,
          user: { select: { firstName: true, lastName: true, profileImage: true } },
        },
        orderBy: { user: { firstName: 'asc' } },
      })
      : Promise.resolve([]),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true, logo: true, contactPhone: true, website: true },
    }),
  ]);

  const flatTeachers = teachers.map(t => ({
    id: t.id,
    firstName: t.user?.firstName ?? '',
    lastName: t.user?.lastName ?? '',
    employeeCode: t.employeeCode,
    profileImage: t.user?.profileImage ?? null,
  }));

  const flatStudents = students.map(s => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    profileImage: s.profileImage ?? null,
    rollNumber: s.rollNumber,
    grade: s.grade?.grade ?? '',
    section: s.section?.name ?? '',
  }));

  return (
    <IdCardsPage
      students={flatStudents}
      teachers={flatTeachers}
      organization={{
        name: organization?.name || 'Your School',
        logo: organization?.logo || undefined,
        phone: organization?.contactPhone || undefined,
        website: organization?.website || undefined,
      }}
    />
  );
}
