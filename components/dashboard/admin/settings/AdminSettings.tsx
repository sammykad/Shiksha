import prisma from "@/lib/db"
import { getDatabaseOrganization, getOrganizationId } from "@/lib/organization"
import AdminSettingsSidebar from "@/components/dashboard/admin/settings/AdminSettingsSidebar"
import GeneralSettings from "@/components/dashboard/admin/settings/GeneralSettings"
import ConfigSettings from "@/components/dashboard/admin/settings/ConfigSettings"
import { GradingSettings } from "@/components/dashboard/admin/settings/GradingSettings"
import { NotificationSettings } from "@/components/dashboard/admin/settings/NotificationSettings"
import RolePermissions from "@/components/dashboard/admin/settings/RolePermissions"
import BillingSettings from "./BillingSettings"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Settings2 } from "lucide-react"
import { getBillingSummary, getPublicPlans } from "@/lib/subscription-billing"
import { getOrganizationNotificationSettings } from "@/lib/notifications/organization-notification-settings"
import { getAcademicYears, getCurrentAcademicYearIdSafe } from "@/lib/academicYear"
import { Role } from "@/generated/prisma/enums"

async function getStaffMembers(organizationId: string) {
  const memberships = await prisma.membership.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      role: { in: [Role.ADMIN, Role.TEACHER] },
      user: { isActive: true },
    },
    select: {
      role: true,
      organization: { select: { name: true } },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
        },
      },
    },
  })

  return memberships.map((m) => {
    const first = m.user.firstName ?? ""
    const last = m.user.lastName ?? ""
    return {
      id: m.user.id,
      name: `${first} ${last}`.trim(),
      role: m.role,
      organization: m.organization.name,
      initials: `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase(),
      avatarUrl: m.user.profileImage ?? undefined,
    }
  })
}

export default async function AdminSettingsPage() {
  const organizationId = await getOrganizationId()
  const academicYearId = await getCurrentAcademicYearIdSafe()

  const [organization, academicYears, notificationSettings, staffMembers, billingPlans] = await Promise.all([
    getDatabaseOrganization(organizationId),
    getAcademicYears(organizationId),
    getOrganizationNotificationSettings(organizationId),
    getStaffMembers(organizationId),
    getPublicPlans(),
  ])

  const billingSummary = await getBillingSummary(organizationId, academicYearId)

  if (!organization) {
    return <EmptyState title="Organization not found" description="Please contact support." />
  }

  return (
    <div className="bg-background px-2">
      <PageHeader
        title="Admin Settings"
        description="Manage your application settings, configurations, and access controls."
        icon={Settings2}
      />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4">
        <AdminSettingsSidebar
          sections={{
            general: <GeneralSettings organization={organization} />,
            configurations: (
              <ConfigSettings academicYears={academicYears} organizationId={organizationId} />
            ),
            grading: (
              <GradingSettings organizationType={organization.organizationType ?? undefined} />
            ),
            notifications: (
              <NotificationSettings notificationSettings={notificationSettings} />
            ),
            billing: (
              <BillingSettings
                billingSummary={billingSummary}
                plans={billingPlans.map((plan) => ({
                  code: plan.code,
                  name: plan.name,
                  description: plan.description ?? "Shiksha.cloud subscription plan.",
                  monthlyPrice: plan.monthlyPrice ?? 0,
                  annualPrice: plan.annualPrice ?? 0,
                  studentLimit: plan.studentLimit ?? 0,
                }))}
              />
            ),
            permissions: <RolePermissions users={staffMembers} />,
          }}
        />
      </div>
    </div>
  )
}