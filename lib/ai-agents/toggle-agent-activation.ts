'use server'

import prisma from '@/lib/db'
import { getOrganizationId } from '@/lib/organization'
import { revalidatePath } from 'next/cache'

export async function toggleAgentActivation(agentId: string) {
  const organizationId = await getOrganizationId()

  const agent = await prisma.aiAgent.findFirst({
    where: { id: agentId, organizationId },
  })
  if (!agent) throw new Error('Agent not found')

  const newStatus = agent.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'

  await prisma.aiAgent.update({
    where: { id: agentId },
    data: { status: newStatus },
  })

  revalidatePath('/dashboard/agents')
  revalidatePath(`/dashboard/agents/${agentId}`)
}
