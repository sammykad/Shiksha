import prisma from "@/lib/db"
import { getDatabaseOrganization, getOrganizationId } from "@/lib/organization"
import AdminSettingsSidebar from "@/components/dashboard/admin/settings/AdminSettingsSidebar"
import GeneralSettings from "@/components/dashboard/admin/settings/GeneralSettings"
import ConfigSettings from "@/components/dashboard/admin/settings/ConfigSettings"
import { GradingSettings } from "@/components/dashboard/admin/settings/GradingSettings"
import { NotificationSettings } from "@/components/dashboard/admin/settings/NotificationSettings"
import RolesAccessSettings from "@/components/dashboard/admin/settings/RolesAccessSettings"
import RolePermissions from "@/components/dashboard/admin/settings/RolePermissions"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Settings2 } from "lucide-react"
import { getBillingSummary } from "@/lib/billing"
import BillingSettings from "./BillingSettings"
import { getOrganizationNotificationSettings } from "@/lib/notifications/organization-notification-settings"
import { getAcademicYears, getCurrentAcademicYearIdSafe } from "@/lib/academicYear"

export interface RoleData {
  id: string
  name: string
  type: "System" | "Custom"
  description: string
  users: number
  permissions: string[]
}

export interface RolesAccessData {
  roles: RoleData[]
  defaultRole: string
  requireManualApproval: boolean
}

// Static role definitions with permissions
const ROLE_DEFINITIONS = {
  ADMIN: {
    description: "Full system access and management",
    permissions: ["Manage Users", "View Reports", "Settings", "Manage Roles", "Manage Organization"]
  },
  TEACHER: {
    description: "Can manage classes, students, and grades",
    permissions: ["Manage Classes", "Upload Marks", "View Students", "Manage Attendance", "Create Assignments"]
  },
  STUDENT: {
    description: "Basic student access to view own data",
    permissions: ["View Profile", "View Results", "View Attendance", "View Assignments", "Submit Assignments"]
  },
  PARENT: {
    description: "Can view child's profile and academic information",
    permissions: ["View Profile", "View Results", "View Attendance", "View Fees", "View Exams", "View Notifications"]
  }
}

async function getRolesAccessData(organizationId: string): Promise<RolesAccessData> {
  // Get user counts per role from your database
  const roleCounts = await prisma.user.groupBy({
    by: ['role'],
    where: {
      organizationId: organizationId,
      isActive: true
    },
    _count: {
      role: true
    }
  })

  // Map to RoleData format
  const roles: RoleData[] = roleCounts.map(({ role, _count }) => ({
    id: role,
    name: role.charAt(0) + role.slice(1).toLowerCase(), // "ADMIN" -> "Admin"
    type: "System" as const, // All current roles are system roles
    description: ROLE_DEFINITIONS[role].description,
    users: _count.role,
    permissions: ROLE_DEFINITIONS[role].permissions
  }))

  // Ensure all 4 roles are present even if count is 0
  const allRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] as const
  allRoles.forEach(roleName => {
    if (!roles.find(r => r.id === roleName)) {
      roles.push({
        id: roleName,
        name: roleName.charAt(0) + roleName.slice(1).toLowerCase(),
        type: "System",
        description: ROLE_DEFINITIONS[roleName].description,
        users: 0,
        permissions: ROLE_DEFINITIONS[roleName].permissions
      })
    }
  })

  // Sort by role hierarchy: ADMIN -> TEACHER -> STUDENT -> PARENT
  const roleOrder = { ADMIN: 0, TEACHER: 1, STUDENT: 2, PARENT: 3 }
  roles.sort((a, b) => roleOrder[a.id as keyof typeof roleOrder] - roleOrder[b.id as keyof typeof roleOrder])

  return {
    roles,
    defaultRole: "STUDENT", // Default role for new users
    requireManualApproval: false // Can be made configurable later
  }
}



export default async function AdminSettingsPage() {
  const organizationId = await getOrganizationId()
  const academicYearId = await getCurrentAcademicYearIdSafe()

  const [organization, academicYears, notificationSettings, rolesAccessData, usersWithRoles] = await Promise.all([
    getDatabaseOrganization(organizationId),
    getAcademicYears(organizationId),
    getOrganizationNotificationSettings(organizationId),
    getRolesAccessData(organizationId),
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
          {/* <RolesAccessSettings data={rolesAccessData} /> */}
          <RolePermissions
            users={usersWithRoles.map((user) => ({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role.toLowerCase() as "admin" | "teacher",
              organization: organization.name,
              initials: `${user.firstName[0]}${user.lastName[0]}`,
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