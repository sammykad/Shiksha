import prisma from '@/lib/db';
import AttendanceMark from '@/components/dashboard/StudentAttendance/attendance-mark';
import { getOrganizationId } from '@/lib/organization';

async function getStudents() {
  const organizationId = await getOrganizationId();
  const data = await prisma.student.findMany({
    where: {
      organizationId: organizationId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rollNumber: true,
      section: true,
      profileImage: true,
      gradeId: true,
      grade: {
        select: {
          id: true,
          grade: true,
        },
      },
      StudentAttendance: {
        select: {
          id: true,
          date: true,
          status: true,
          note: true,
          recordedBy: true,
          sectionId: true,
          createdAt: true,
        },
      },
    },
  });
  return data;
}

export default async function MarkAttendancePage() {
  const organizationId = await getOrganizationId();

  const students = await getStudents();
  const grades = await prisma.grade.findMany({
    where: { organizationId },
    select: { id: true, grade: true },
    orderBy: { grade: 'asc' }, // optional: sort 1 → 12
  });

  const sections = await prisma.section.findMany({
    where: { organizationId },
    select: { id: true, name: true, gradeId: true },
    orderBy: { name: 'asc' },
  });



  return (
    <AttendanceMark students={students} grades={grades} sections={sections} />
  );
}
