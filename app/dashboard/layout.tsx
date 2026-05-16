import BreadCrumbNavigation from "@/components/dashboard-layout/BreadCrumbNavigation";
import AdminPanelLayout from "@/components/dashboard-layout/dashboard-panel-layout";
import { Navbar } from "@/components/dashboard-layout/navbar";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/db";
import { TerminologyProvider } from "@/context/terminology";
import { AcademicYearProvider } from "@/context/AcademicYearContext";
import { getAcademicYears, getActiveAcademicYearId } from "@/lib/academicYear";
import RoleLayoutWrapper from "@/components/dashboard-layout/role-layout-wrapper";
import { getOnboardingStatus } from "@/lib/onboarding";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { getRequiredRoles, isAllowed, ROLE_HOMEPAGE, type AppRole } from "@/lib/rbac";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId, orgRole } = await auth();

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/dashboard";
  const appRole = orgRole.toLowerCase() as AppRole;
  const requiredRoles = getRequiredRoles(pathname);

  if (requiredRoles && !isAllowed(appRole, requiredRoles)) {
    redirect(ROLE_HOMEPAGE[appRole] ?? "/dashboard");
  }

  if (
    orgRole === "ADMIN" &&
    !pathname.includes("/onboarding") &&
    !pathname.includes("/settings")
  ) {
    const { needsOnboarding } = await getOnboardingStatus();
    if (needsOnboarding) redirect("/dashboard/onboarding");
  }

  const [organization, academicYears, activeYearId] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { organizationType: true },
    }),
    getAcademicYears(orgId),
    getActiveAcademicYearId(),
  ]);


  return (
    <TerminologyProvider organizationType={organization?.organizationType}>
      <AcademicYearProvider
        years={academicYears}
        initialActiveYearId={activeYearId}
      >
        <RoleLayoutWrapper role={orgRole as Role} userId={userId}>
          <AdminPanelLayout role={orgRole as Role}>
            <Navbar />
            <BreadCrumbNavigation />
            <div className="px-2 sm:px-4 pb-2">{children}</div>
          </AdminPanelLayout>
        </RoleLayoutWrapper>
      </AcademicYearProvider>
    </TerminologyProvider>
  );
}
