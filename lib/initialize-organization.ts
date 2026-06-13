import { createMissingAgentsFromRegistry } from '@/lib/ai-agents/create-agents'
import { createOrganizationNotificationSettings } from '@/lib/notifications/organization-notification-settings'

/** Full org bootstrap: create default agents + notification settings. */
export async function initializeOrganization(orgId: string, userId: string) {
  await Promise.all([
    createMissingAgentsFromRegistry(orgId, userId),
    createOrganizationNotificationSettings(orgId),
  ])
}
