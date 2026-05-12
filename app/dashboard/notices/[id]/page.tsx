import prisma from '@/lib/db';
import NoticeViewer from '@/components/dashboard/notice/notice-viewer';
import { getCurrentUserByRole } from '@/lib/auth';
import { getOrganizationId } from '@/lib/organization';
import { notFound } from 'next/navigation';

export default async function NoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ role }, organizationId] = await Promise.all([
    getCurrentUserByRole(),
    getOrganizationId(),
  ]);

  const notice = await prisma.notice.findUnique({
    where: { id },
    include: { attachments: true },
  });

  if (!notice || notice.organizationId !== organizationId) notFound();

  const targetGrades = notice.targetGrades as string[];
  const targetSections = notice.targetSections as string[];

  const [grades, sections] = await Promise.all([
    targetGrades.length > 0
      ? prisma.grade.findMany({
        where: { id: { in: targetGrades } },
        select: { id: true, grade: true },
      })
      : Promise.resolve([]),
    targetSections.length > 0
      ? prisma.section.findMany({
        where: { id: { in: targetSections } },
        select: { id: true, name: true, gradeId: true },
      })
      : Promise.resolve([]),
  ]);

  const gradeNames: Record<string, string> = Object.fromEntries(
    grades.map((g) => [g.id, g.grade])
  );

  const sectionsByGrade: Record<string, { id: string; name: string }[]> = {};
  for (const s of sections) {
    if (!sectionsByGrade[s.gradeId]) sectionsByGrade[s.gradeId] = [];
    sectionsByGrade[s.gradeId].push({ id: s.id, name: s.name });
  }

  return (
    <NoticeViewer
      notice={notice}
      userRole={role}
      gradeNames={gradeNames}
      sectionsByGrade={sectionsByGrade}
    />
  );
}