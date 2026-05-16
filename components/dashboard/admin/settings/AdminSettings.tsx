import prisma from "@/lib/db"
import { getDatabaseOrganization, getOrganizationId } from "@/lib/organization"
import AdminSettingsSidebar from "@/components/dashboard/admin/settings/AdminSettingsSidebar"
import GeneralSettings from "@/components/dashboard/admin/settings/GeneralSettings"
import ConfigSettings from "@/components/dashboard/admin/settings/ConfigSettings"
import { GradingSettings } from "@/components/dashboard/admin/settings/GradingSettings"
import { NotificationSettings } from "@/components/dashboard/admin/settings/NotificationSettings"
import RolePermissions from "@/components/dashboard/admin/settings/RolePermissions"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Settings2 } from "lucide-react"
import { getBillingSummary } from "@/lib/billing"
import BillingSettings from "./BillingSettings"
import { getOrganizationNotificationSettings } from "@/lib/notifications/organization-notification-settings"
import { getAcademicYears, getCurrentAcademicYearIdSafe } from "@/lib/academicYear"

export default async function AdminSettingsPage() {
  const organizationId = await getOrganizationId()
  const academicYearId = await getCurrentAcademicYearIdSafe()

  const [organization, academicYears, notificationSettings, staff] = await Promise.all([
    getDatabaseOrganization(organizationId),
    getAcademicYears(organizationId),
    getOrganizationNotificationSettings(organizationId),
    prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        role: { in: ["ADMIN", "TEACHER"] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileImage: true,
      },
    }),
  ])

  const billingSummary = academicYearId
    ? await getBillingSummary(organizationId, academicYearId)
    : null

  if (!organization) {
    return (
      <EmptyState title="Organization not found" description="Please contact support." />
    )
  }

  console.log(staff)

  return (
    <div className=" bg-background px-2">
      {/* Header */}
      <PageHeader
        title="Admin Settings"
        description="Manage your application settings, configurations, and access controls."
        icon={Settings2}
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4">
        <AdminSettingsSidebar>
          <GeneralSettings organization={organization} />
          <ConfigSettings academicYears={academicYears} organizationId={organizationId} />
          <GradingSettings organizationType={organization.organizationType ?? undefined} />
          <NotificationSettings notificationSettings={notificationSettings} />
          {billingSummary ? (
            <BillingSettings
              billingSummary={billingSummary}
              organization={organization}
            />
          ) : (
            <BillingSettingsDisabled />
          )}
          <RolePermissions
            users={staff.map((user) => ({
              id: user.id,
              name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown User",
              role: user.role,
              organization: organization.name,
              initials: `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?",
              avatarUrl: user.profileImage || undefined,
            }))}
          />
        </AdminSettingsSidebar>
      </div>
    </div>
  )
}


const BillingSettingsDisabled = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Settings</CardTitle>
        <CardDescription>
          Billing settings are disabled for this organization. Please setup academic year to enable billing.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

// https://dribbble.com/shots/26544075-Realtor-agent-Permissions-page-for-real-estate-platform