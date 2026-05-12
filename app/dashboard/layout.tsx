import BreadCrumbNavigation from '@/components/dashboard-layout/BreadCrumbNavigation';
import AdminPanelLayout from '@/components/dashboard-layout/dashboard-panel-layout';
import { Navbar } from '@/components/dashboard-layout/navbar';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/db';
import { TerminologyProvider } from '@/context/terminology';
import { AcademicYearProvider } from '@/context/AcademicYearContext';
import { getAcademicYears, getActiveAcademicYearId } from '@/lib/academicYear';
import { syncOrganizationUser } from '@/lib/syncUser';
import RoleLayoutWrapper from '@/components/dashboard-layout/role-layout-wrapper';
import { ClerkProvider } from '@clerk/nextjs';
import { getOnboardingStatus } from '@/lib/onboarding';
import { headers } from 'next/headers';

// Dashboard should NOT be indexed by search engines
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const ROLE_MAP: Record<string, 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'> = {
  'org:admin': 'ADMIN',
  'org:teacher': 'TEACHER',
  'org:student': 'STUDENT',
  'org:parent': 'PARENT',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgRole, orgId } = await auth();

  if (!userId) {
    const { redirectToSignIn } = await auth();
    redirectToSignIn();
  }
  if (!orgId || !orgRole) redirect('/select-organization?returnUrl=/dashboard');

  await syncOrganizationUser(orgId, orgRole, userId);

  // Get current pathname from headers (injected by proxy.ts middleware)
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  // Guard — only runs for non-onboarding/settings routes to avoid redirect loops and allow configuration
  if (orgRole === 'org:admin' && !pathname.includes('/onboarding') && !pathname.includes('/settings')) {
    const { needsOnboarding } = await getOnboardingStatus();
    if (needsOnboarding) redirect('/dashboard/onboarding');
  }

  const [organization, academicYears, activeYearId] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { organizationType: true },
    }),
    getAcademicYears(orgId),
    getActiveAcademicYearId(),
  ]);

  const role = ROLE_MAP[orgRole] ?? 'STUDENT';

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <TerminologyProvider organizationType={organization?.organizationType}>
        <AcademicYearProvider years={academicYears} initialActiveYearId={activeYearId}>
          <RoleLayoutWrapper role={role} userId={userId}>
            <AdminPanelLayout role={role}>
              <Navbar />
              <BreadCrumbNavigation />
              <div className="px-2 sm:px-4 pb-2">{children}</div>
            </AdminPanelLayout>
          </RoleLayoutWrapper>
        </AcademicYearProvider>
      </TerminologyProvider>
    </ClerkProvider >
  );
}