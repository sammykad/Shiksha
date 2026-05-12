import NoticeList from '@/components/dashboard/notice/notice-list';
import prisma from '@/lib/db';
import { Prisma } from '@/generated/prisma/client';
import Link from 'next/link';
import { Suspense } from 'react';
import Loading from './loading';
import { getOrganizationId, getOrganizationType } from '@/lib/organization';
import { EmptyState } from '@/components/ui/empty-state';
import { Activity, Pin, Newspaper, Plus } from 'lucide-react';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getCurrentUserByRole } from '@/lib/auth';
import { getCurrentUser } from '@/lib/user';
import { Card, CardContent } from '@/components/ui/card';
import { getTerminology } from '@/lib/terminology';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page: pageParam } = await searchParams;
  const parsedPage = Number(pageParam);
  // Validate pagination: default to 1, ensure positive integer
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  const [{ role, userId }, organizationId, user] = await Promise.all([
    getCurrentUserByRole(),
    getOrganizationId(),
    getCurrentUser(),
  ]);
  const academicYearId = await getActiveAcademicYearId();
  const organizationType = await getOrganizationType(organizationId);
  const terms = getTerminology(organizationType);

  const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.id;

  // ── Build where filter based on role ───────────────────────────────────────

  const baseWhere: Prisma.NoticeWhereInput = {
    organizationId,
    academicYearId,
  };

  const where: Prisma.NoticeWhereInput = (() => {
    if (role === 'ADMIN') {
      // Admin sees everything
      return baseWhere;
    }

    if (role === 'TEACHER') {
      return {
        ...baseWhere,
        OR: [
          { status: { in: ['PUBLISHED', 'EXPIRED'] } },
          {
            status: { in: ['DRAFT', 'PENDING_REVIEW', 'REJECTED'] },
            createdBy: userName || user.id, // privacy: only their own
          },
        ],
      };
    }

    // STUDENT or PARENT — only published notices targeted at their role
    return {
      ...baseWhere,
      status: { in: ['PUBLISHED', 'EXPIRED'] },
      targetRoles: { has: role },
    };
  })();

  // ── Fetch — pinned always first, then paginated regular ────────────────────
  const isAdmin = role === 'ADMIN';

  const [pendingNotices, pinnedNotices, regularNotices, totalCount] = await Promise.all([
    // PENDING_REVIEW — admin only, always top
    isAdmin
      ? prisma.notice.findMany({
        where: { ...where, status: 'PENDING_REVIEW' },
        orderBy: { createdAt: 'desc' },
      })
      : Promise.resolve([]),

    // Pinned + published (skip PENDING_REVIEW for admin since already fetched above)
    prisma.notice.findMany({
      where: {
        ...where,
        isPinned: true,
        ...(isAdmin && { status: { not: 'PENDING_REVIEW' } }),
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Regular paginated
    prisma.notice.findMany({
      where: {
        ...where,
        isPinned: false,
        ...(isAdmin && { status: { not: 'PENDING_REVIEW' } }),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),

    prisma.notice.count({ where }),
  ]);

  const notices = [...pendingNotices, ...pinnedNotices, ...regularNotices];

  // ── Resolve grade + section names across all fetched notices ───────────────
  // Collect all unique IDs from every notice in one pass

  const allGradeIds = [...new Set(notices.flatMap((n) => n.targetGrades as string[]))];
  const allSectionIds = [...new Set(notices.flatMap((n) => n.targetSections as string[]))];

  const [grades, sections] = await Promise.all([
    allGradeIds.length > 0
      ? prisma.grade.findMany({
        where: { id: { in: allGradeIds } },
        select: { id: true, grade: true },
      })
      : Promise.resolve([]),
    allSectionIds.length > 0
      ? prisma.section.findMany({
        where: { id: { in: allSectionIds } },
        select: { id: true, name: true },
      })
      : Promise.resolve([]),
  ]);

  const gradeNames: Record<string, string> = Object.fromEntries(
    grades.map((g) => [g.id, g.grade])
  );
  const sectionNames: Record<string, string> = Object.fromEntries(
    sections.map((s) => [s.id, s.name])
  );

  // ── Static config ──────────────────────────────────────────────────────────

  const roleDescriptions: Record<string, string> = {
    ADMIN: `Manage all notices across your ${terms.institute}. Create, review, and publish announcements.`,
    TEACHER: `Share updates with students and parents. Create and track your class notices.`,
    STUDENT: `Stay up to date with the latest announcements from your ${terms.institute}.`,
    PARENT: `View important updates and announcements from your child's ${terms.institute}.`,
  };

  const emptyStateConfig: Record<string, { title: string; description: string }> = {
    ADMIN: { title: 'No notices yet', description: 'Create your first announcement to keep everyone informed.' },
    TEACHER: { title: 'Your notice board is empty', description: 'Post notices to share updates or important class information.' },
    STUDENT: { title: 'Nothing here yet', description: 'Check back later for updates from your teachers and school.' },
    PARENT: { title: 'No notices available', description: "Your child's school will post important notices here." },
  };

  const empty = emptyStateConfig[role] ?? { title: 'No notices', description: '' };
  const canCreate = role === 'ADMIN' || role === 'TEACHER';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Card className="mx-2">
      <PageHeader
        title={`Notices${totalCount > 0 ? ` (${totalCount})` : ''}`}
        description={roleDescriptions[role]}
        actions={
          canCreate && (
            <Button asChild size="sm" className='gap-2'>
              <Link href="/dashboard/notices/create">
                <Plus className="h-4 w-4" />
                Create notice
              </Link>
            </Button>
          )
        }
      />

      <CardContent className="p-2">
        {totalCount === 0 ? (
          <div className="flex items-center justify-center py-8">
            <EmptyState
              title={empty.title}
              description={empty.description}
              icons={[Newspaper, Activity, Pin]}
              image="/EmptyStatePageNotFound.png"
            />
          </div>
        ) : (
          <Suspense fallback={<Loading />}>
            <NoticeList
              notices={notices}
              userRole={role}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              gradeNames={gradeNames}
              sectionNames={sectionNames}
            />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
};

export default Page;