import prisma from '@/lib/db'

/** Check agent status + get its config. Zero AI SDK dependency. */
export async function getAgentConfig(agentId: string): Promise<{
  enabled: true
  config: Record<string, unknown>
} | {
  enabled: false
  message: string
}> {
  const agent = await prisma.aiAgent.findUnique({
    where: { id: agentId },
    include: { config: true },
  })

  if (!agent) {
    return { enabled: false, message: 'Agent not found' }
  }

  if (agent.status !== 'ACTIVE') {
    return { enabled: false, message: `Agent "${agent.name}" is not active (${agent.status})` }
  }

  return {
    enabled: true,
    config: (agent.config?.config as Record<string, unknown>) ?? {},
  }
}
