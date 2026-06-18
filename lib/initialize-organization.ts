import { createMissingAgentsFromRegistry } from '@/lib/ai-agents/create-agents'
import { createOrganizationNotificationSettings } from '@/lib/notifications/organization-notification-settings'
import { createTrialSubscription } from '@/lib/subscription-billing'

/** Full org bootstrap: default agents + notification settings + trial subscription. */
export async function initializeOrganization(orgId: string, userId: string) {
  await Promise.all([
    createMissingAgentsFromRegistry(orgId, userId),
    createOrganizationNotificationSettings(orgId),
    createTrialSubscription({
      organizationId: orgId,
      createdBy: userId,
    }),
  ])
}
