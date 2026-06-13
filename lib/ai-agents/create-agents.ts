import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma-base'
import { AGENT_REGISTRY } from './registry'

function getNextRunAt(scheduleTime: string = "23:00"): Date {
  const [hours, minutes] = scheduleTime.split(":").map(Number)
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)
  if (next <= new Date()) next.setDate(next.getDate() + 1)
  return next
}

/** Finds which agents from the registry are missing for an org and creates them. */
export async function createMissingAgentsFromRegistry(orgId: string, userId?: string) {
  const existing = await prisma.aiAgent.findMany({
    where: { organizationId: orgId },
    select: { name: true },
  })
  const existingNames = new Set(existing.map(a => a.name))

  const creates = Object.values(AGENT_REGISTRY)
    .filter(entry => !existingNames.has(entry.name))
    .map(entry => {
      const defaultReport = entry.defaultConfig.report as Record<string, unknown> | undefined
      const config = userId
        ? { ...entry.defaultConfig, report: { ...(defaultReport ?? {}), deliverTo: [userId] } }
        : { ...entry.defaultConfig }

      return prisma.aiAgent.create({
        data: {
          organizationId: orgId,
          name: entry.name,
          description: entry.description,
          status: 'ACTIVE',
          config: {
            create: { config: config as Prisma.InputJsonValue },
          },
          nextRunAt: getNextRunAt(),
        },
      })
    })

  if (creates.length > 0) {
    await prisma.$transaction(creates)
  }
}
