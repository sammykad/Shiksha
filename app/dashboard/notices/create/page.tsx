import CreateNotice from '@/components/dashboard/notice/create-notice';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { sortByNaturalText } from '@/lib/utils';

export default async function CreateNoticePage() {
  const organizationId = await getOrganizationId();

  const rawGrades = await prisma.grade.findMany({
    where: { organizationId },
    include: { section: { orderBy: { name: 'asc' } } },
  });

  const grades = sortByNaturalText(rawGrades, (grade) => grade.grade).map(
    (grade) => ({
      ...grade,
      section: sortByNaturalText(grade.section, (section) => section.name),
    })
  );

  return <CreateNotice grades={grades} />;
}
