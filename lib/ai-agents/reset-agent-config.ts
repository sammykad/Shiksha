'use server'

import prisma from '@/lib/db'
import { getOrganizationId } from '@/lib/organization'
import { AGENT_REGISTRY } from '@/lib/ai-agents/registry'
import { revalidatePath } from 'next/cache'

function getNextRunAt(): Date {
  const next = new Date()
  next.setHours(23, 0, 0, 0)
  if (next <= new Date()) next.setDate(next.getDate() + 1)
  return next
}

export async function resetOrganizationAgents() {
  const organizationId = await getOrganizationId()

  const agents = await prisma.aiAgent.findMany({
    where: { organizationId },
    select: { id: true, name: true },
  })

  if (agents.length > 0) {
    const ids = agents.map(a => a.id)
    await prisma.aiAgentReport.deleteMany({ where: { agentId: { in: ids } } })
    await prisma.aiAgentExecutionLog.deleteMany({ where: { agentId: { in: ids } } })
    await prisma.aiAgentConfig.deleteMany({ where: { agentId: { in: ids } } })
    await prisma.aiAgent.deleteMany({ where: { id: { in: ids } } })
  }

  for (const entry of Object.values(AGENT_REGISTRY)) {
    await prisma.aiAgent.create({
      data: {
        organizationId,
        name: entry.name,
        description: entry.description,
        status: 'ACTIVE',
        config: {
          create: { config: entry.defaultConfig as any },
        },
        nextRunAt: getNextRunAt(),
      },
    })
  }

  revalidatePath('/dashboard/agents')
  return { success: true, redirect: '/dashboard/agents' }
}
