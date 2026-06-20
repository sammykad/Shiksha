import BreadCrumbNavigation from "@/components/dashboard-layout/BreadCrumbNavigation";
import AdminPanelLayout from "@/components/dashboard-layout/dashboard-panel-layout";
import { Navbar } from "@/components/dashboard-layout/navbar";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { TerminologyProvider } from "@/context/terminology";
import { AcademicYearProvider } from "@/context/AcademicYearContext";
import { getAcademicYears } from "@/lib/academicYear";
import { getOrganizationType } from "@/lib/organization";
import RoleLayoutWrapper from "@/components/dashboard-layout/role-layout-wrapper";
import { getOnboardingStatus } from "@/lib/onboarding";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { getRequiredRoles, isAllowed, ROLE_HOMEPAGE } from "@/lib/rbac";

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
  const { userId, orgId, orgRole, user } = await auth();

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "/dashboard";
  const requiredRoles = getRequiredRoles(pathname);

  if (requiredRoles && !isAllowed(orgRole, requiredRoles)) {
    redirect(ROLE_HOMEPAGE[orgRole] ?? "/dashboard");
  }

  if (
    orgRole === "ADMIN" &&
    !pathname.includes("/onboarding")
  ) {
    const { needsOnboarding } = await getOnboardingStatus();
    if (needsOnboarding) redirect("/dashboard/onboarding");
  }

  const [organizationType, academicYears] = await Promise.all([
    getOrganizationType(orgId),
    getAcademicYears(orgId),
  ]);


  return (
    <TerminologyProvider organizationType={organizationType}>
      <AcademicYearProvider years={academicYears} organizationId={orgId}>
        <RoleLayoutWrapper role={orgRole} userId={userId}>
          <AdminPanelLayout role={orgRole}>
            <Navbar user={user} orgRole={orgRole} />
            <BreadCrumbNavigation />
            <div className="px-2 sm:px-4 pb-2">{children}</div>
          </AdminPanelLayout>
        </RoleLayoutWrapper>
      </AcademicYearProvider>
    </TerminologyProvider>
  );
}
