'use server'

import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/db'
import { getOrganizationId } from '@/lib/organization'
import { revalidatePath } from 'next/cache'
import { AGENT_REGISTRY } from '@/lib/ai-agents/registry'

function getNextRunAt(): Date {
  const next = new Date()
  next.setHours(23, 0, 0, 0)
  if (next <= new Date()) next.setDate(next.getDate() + 1)
  return next
}

export async function ensureAgentByName(name: string) {
  const organizationId = await getOrganizationId()
  const entry = AGENT_REGISTRY[name] ?? Object.values(AGENT_REGISTRY).find(e => e.name === name)
  if (!entry) throw new Error(`Unknown agent: ${name}`)

  const existing = await prisma.aiAgent.findFirst({
    where: { name: entry.name, organizationId },
  })
  if (existing) return { success: true, agentId: existing.id, created: false }

  const agent = await prisma.aiAgent.create({
    data: {
      organizationId,
      name: entry.name,
      description: entry.description,
      status: 'ACTIVE',
      config: {
        create: { config: entry.defaultConfig as Prisma.InputJsonValue },
      },
      nextRunAt: getNextRunAt(),
    },
  })

  revalidatePath('/dashboard/agents')
  return { success: true, agentId: agent.id, created: true }
}
