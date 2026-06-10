'use server'

import prisma from '@/lib/db'
import { getOrganizationId } from '@/lib/organization'
import { revalidatePath } from 'next/cache'

export async function updateAgentConfig(
  agentId: string,
  config: Record<string, unknown>,
) {
  const organizationId = await getOrganizationId()

  const agent = await prisma.aiAgent.findFirst({
    where: { id: agentId, organizationId },
  })
  if (!agent) throw new Error('Agent not found')

  const existing = await prisma.aiAgentConfig.findUnique({
    where: { agentId },
  })

  if (existing) {
    await prisma.aiAgentConfig.update({
      where: { agentId },
      data: { config: config as any },
    })
  } else {
    await prisma.aiAgentConfig.create({
      data: { agentId, config: config as any },
    })
  }

  revalidatePath(`/dashboard/agents/${agentId}`)
  return { success: true }
}

export async function updateAgentSchedule(
  agentId: string,
  data: { runFrequency?: string; scheduleTime?: string },
) {
  const organizationId = await getOrganizationId()

  const agent = await prisma.aiAgent.findFirst({
    where: { id: agentId, organizationId },
  })
  if (!agent) throw new Error('Agent not found')

  await prisma.aiAgent.update({
    where: { id: agentId },
    data: {
      ...(data.runFrequency ? { runFrequency: data.runFrequency as any } : {}),
      ...(data.scheduleTime ? { scheduleTime: data.scheduleTime } : {}),
    },
  })

  revalidatePath(`/dashboard/agents/${agentId}`)
  return { success: true }
}
