import prisma from './prisma-base'
import { createMissingAgentsFromRegistry } from '@/lib/ai-agents/create-agents'
import { createOrganizationNotificationSettings } from '@/lib/notifications/organization-notification-settings'
import { createTrialSubscription } from '@/lib/subscription-billing'

async function createDefaultAcademicYear(orgId: string) {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const startYear = currentMonth >= 3 ? currentYear : currentYear - 1
    const endYear = startYear + 1

    await prisma.academicYear.create({
      data: {
        name: `${startYear}-${endYear.toString().slice(2)}`,
        startDate: new Date(startYear, 3, 1),
        endDate: new Date(endYear, 2, 31),
        type: 'ANNUAL',
        isCurrent: true,
        organizationId: orgId,
        createdBy: 'SYSTEM',
      },
    })
  } catch (error) {
    console.error('Failed to create default academic year:', error)
  }
}

/** Full org bootstrap: default agents + notification settings + trial subscription + default academic year. */
export async function initializeOrganization(orgId: string, userId: string) {
  await Promise.all([
    createMissingAgentsFromRegistry(orgId, userId),
    createOrganizationNotificationSettings(orgId),
    createTrialSubscription({ organizationId: orgId, createdBy: userId }),
    createDefaultAcademicYear(orgId),
  ])
}
