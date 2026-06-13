'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma-base'
import { getOrganizationId } from '@/lib/organization'
import { createMissingAgentsFromRegistry } from './create-agents'

export async function resetOrganizationAgents() {
  try {
    const organizationId = await getOrganizationId()

    // Delete order: child tables first (no cascade deletes in schema)
    //   1. AiAgentReport — FK to AiAgent and AiAgentExecutionLog
    //   2. AiAgentConfig  — FK to AiAgent
    //   3. AiAgentExecutionLog — FK to AiAgent (reports already cleaned)
    //   4. AiAgent — all dependents removed
    await prisma.$transaction([
      prisma.aiAgentReport.deleteMany({ where: { agent: { organizationId } } }),
      prisma.aiAgentConfig.deleteMany({ where: { agent: { organizationId } } }),
      prisma.aiAgentExecutionLog.deleteMany({ where: { organizationId } }),
      prisma.aiAgent.deleteMany({ where: { organizationId } }),
    ])

    // Re-create agents from registry with defaults
    await createMissingAgentsFromRegistry(organizationId)

    revalidatePath('/dashboard/agents')
    return { success: true, redirect: '/dashboard/agents' }
  } catch (error) {
    console.error('resetOrganizationAgents failed:', error)
    return { success: false, error: 'Failed to reset agents. Please try again.' }
  }
}
