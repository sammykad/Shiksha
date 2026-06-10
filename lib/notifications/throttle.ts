import { NotificationStatus } from '@/generated/prisma/enums'
import prisma from '@/lib/db'

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

const PHASES = [
  { fromDay: 0, toDay: 7, name: 'grace', cooldownDays: 7 },
  { fromDay: 8, toDay: 30, name: 'due', cooldownDays: 7 },
  { fromDay: 31, toDay: 60, name: 'overdue', cooldownDays: 14 },
  { fromDay: 61, toDay: Infinity, name: 'critical', cooldownDays: 28 },
] as const

export const MAX_FEE_REMINDERS_PER_MONTH = 4
const REMINDER_WINDOW_START_HOUR_IST = 11
const REMINDER_WINDOW_END_HOUR_IST = 19

export type FeeReminderTemplateType =
  | 'FEE_FRIENDLY_REMINDER'
  | 'FEE_DUE_TODAY'
  | 'FEE_OVERDUE'

export type ThrottleResult = {
  allowed: boolean
  reason?: string
  metadata: {
    phaseName: string
    monthlyCount: number
    maxPerMonth: number
    cooldownRemainingHours: number
  }
}

export function getPhase(daysOverdue: number) {
  return PHASES.find((phase) => daysOverdue >= phase.fromDay && daysOverdue <= phase.toDay) ?? PHASES[PHASES.length - 1]
}

export function checkTimeOfDay(isVoiceCall: boolean, asOf = new Date()): { allowed: boolean; reason?: string } {
  const hour = getIstHour(asOf)

  if (hour >= REMINDER_WINDOW_START_HOUR_IST && hour < REMINDER_WINDOW_END_HOUR_IST) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `${isVoiceCall ? 'Voice calls' : 'Notifications'} only allowed 11:00-19:00 IST`,
  }
}

export async function getMonthlyFeeCounts(
  studentIds: string[],
  organizationId: string,
): Promise<Map<string, number>> {
  if (studentIds.length === 0) return new Map()

  const logs = await prisma.notificationLog.findMany({
    where: {
      organizationId,
      notificationType: 'FEE',
      sentAt: { gte: getCurrentMonthStartInIST() },
      notification: { studentId: { in: studentIds } },
      status: { in: [NotificationStatus.SENT, NotificationStatus.DELIVERED] },
    },
    select: {
      notification: { select: { studentId: true } },
    },
  })

  const counts = new Map<string, number>()
  for (const log of logs) {
    const studentId = log.notification.studentId
    if (studentId) {
      counts.set(studentId, (counts.get(studentId) ?? 0) + 1)
    }
  }

  return counts
}

export async function getMonthlyFeeCount(
  studentId: string,
  organizationId: string,
): Promise<number> {
  const counts = await getMonthlyFeeCounts([studentId], organizationId)
  return counts.get(studentId) ?? 0
}

export function shouldSendManualFeeReminder(params: {
  monthlyCount: number
  templateType: FeeReminderTemplateType
}): { allowed: boolean; reason?: string } {
  if (params.monthlyCount >= MAX_FEE_REMINDERS_PER_MONTH) {
    return { allowed: false, reason: getMonthlyCapReason(params.monthlyCount) }
  }

  if (params.templateType === 'FEE_FRIENDLY_REMINDER') {
    return checkTimeOfDay(false)
  }

  return { allowed: true }
}

export async function canNotifyFee(params: {
  studentId: string
  organizationId: string
  daysOverdue: number
  hoursSinceLastNotification: number
  isVoiceCall: boolean
}): Promise<ThrottleResult> {
  const phase = getPhase(params.daysOverdue)

  const timeCheck = checkTimeOfDay(params.isVoiceCall)
  if (!timeCheck.allowed) {
    return {
      allowed: false,
      reason: timeCheck.reason,
      metadata: buildThrottleMetadata(phase.name, 0, 0),
    }
  }

  const monthlyCount = await getMonthlyFeeCount(params.studentId, params.organizationId)
  if (monthlyCount >= MAX_FEE_REMINDERS_PER_MONTH) {
    return {
      allowed: false,
      reason: getMonthlyCapReason(monthlyCount),
      metadata: buildThrottleMetadata(phase.name, monthlyCount, 0),
    }
  }

  const cooldownHours = phase.cooldownDays * 24
  const cooldownRemainingHours = Math.max(0, cooldownHours - params.hoursSinceLastNotification)

  if (cooldownRemainingHours > 0) {
    return {
      allowed: false,
      reason: `Cooldown active (${phase.name} phase): ${Math.round(cooldownRemainingHours)}h remaining`,
      metadata: buildThrottleMetadata(phase.name, monthlyCount, Math.round(cooldownRemainingHours)),
    }
  }

  return {
    allowed: true,
    metadata: buildThrottleMetadata(phase.name, monthlyCount, 0),
  }
}

function getMonthlyCapReason(count: number) {
  return `Monthly cap reached: ${count}/${MAX_FEE_REMINDERS_PER_MONTH} messages this month`
}

function buildThrottleMetadata(
  phaseName: string,
  monthlyCount: number,
  cooldownRemainingHours: number,
): ThrottleResult['metadata'] {
  return {
    phaseName,
    monthlyCount,
    maxPerMonth: MAX_FEE_REMINDERS_PER_MONTH,
    cooldownRemainingHours,
  }
}

function getIstHour(date: Date) {
  const istDate = new Date(date.getTime() + IST_OFFSET_MS)
  return istDate.getUTCHours()
}

function getCurrentMonthStartInIST(asOf = new Date()) {
  const istDate = new Date(asOf.getTime() + IST_OFFSET_MS)
  return new Date(Date.UTC(istDate.getUTCFullYear(), istDate.getUTCMonth(), 1) - IST_OFFSET_MS)
}
