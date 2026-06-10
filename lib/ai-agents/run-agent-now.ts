'use server'

import prisma from '@/lib/db'
import { getOrganizationId } from '@/lib/organization'
import { runFeeSense } from './runner'
import { revalidatePath } from 'next/cache'

export async function runAgentNow(agentId: string) {
  const organizationId = await getOrganizationId()

  const agent = await prisma.aiAgent.findFirst({
    where: { id: agentId, organizationId },
  })
  if (!agent) throw new Error('Agent not found')
  if (agent.status !== 'ACTIVE') throw new Error('Agent is not active')

  if (agent.name !== 'FeeSense AI') {
    throw new Error(`"${agent.name}" runner not implemented yet`)
  }

  const result = await runFeeSense({
    id: agent.id,
    organizationId: agent.organizationId,
    name: agent.name,
    llmModel: agent.llmModel,
  })

  revalidatePath('/dashboard/agents')
  revalidatePath(`/dashboard/agents/${agentId}`)

  return result
}
