import prisma from '@/lib/db'

/**
 * Phase definitions for fee notification throttling.
 * Each phase has: max messages, cooldown days, volume limit, and a note.
 */
const PHASES = [
  { fromDay: 0,   toDay: 7,   name: 'grace',    maxMessages: 1, cooldownDays: 7,  note: 'Gentle reminder, email only' },
  { fromDay: 8,   toDay: 30,  name: 'due',       maxMessages: 2, cooldownDays: 7,  note: 'Payment due, escalate channels' },
  { fromDay: 31,  toDay: 60,  name: 'overdue',   maxMessages: 2, cooldownDays: 14, note: 'Serious overdue, urgent tone' },
  { fromDay: 61,  toDay: 999, name: 'critical',  maxMessages: 1, cooldownDays: 28, note: 'Critical — office visit notice' },
] as const

/** Hard ceiling: never send more than this per student per calendar month across ALL sources */
const MAX_PER_MONTH = 4

export function getPhase(daysOverdue: number) {
  return PHASES.find((p) => daysOverdue >= p.fromDay && daysOverdue <= p.toDay) ?? PHASES[PHASES.length - 1]
}

/** Check if current IST time is within allowed notification window. */
export function checkTimeOfDay(isVoiceCall: boolean): { allowed: boolean; reason?: string } {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(now.getTime() + istOffset)
  const hour = ist.getUTCHours()

  if (isVoiceCall) {
    // Voice calls: 11 AM – 7 PM IST (school office hours)
    if (hour < 11 || hour >= 19) {
      return { allowed: false, reason: `Voice calls only allowed 11:00–19:00 IST (current hour: ${hour})` }
    }
  } else {
    // Notifications: 11 AM – 7 PM IST (school office hours)
    if (hour < 11 || hour >= 19) {
      return { allowed: false, reason: `Notifications only allowed 11:00–19:00 IST (current hour: ${hour})` }
    }
  }
  return { allowed: true }
}

/** Count fee notifications sent to this student in the current calendar month (any source). */
export async function getMonthlyFeeCount(
  studentId: string,
  organizationId: string,
): Promise<number> {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const ist = new Date(now.getTime() + istOffset)
  const monthStart = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1, 0, 0, 0))

  const count = await prisma.notificationLog.count({
    where: {
      organizationId,
      notificationType: 'FEE',
      sentAt: { gte: monthStart },
      notification: {
        studentId,
      },
      status: { in: ['SENT', 'DELIVERED'] },
    },
  })

  return count
}

export type ThrottleResult = {
  allowed: boolean
  reason?: string
  metadata: {
    phaseName: string
    monthlyCount: number
    maxPerMonth: number
    phaseMaxMessages: number
    cooldownRemainingHours: number
  }
}

/**
 * Centralized throttle gate for fee notifications.
 * Both FeeSense agent and manual reminder path must pass through this.
 *
 * Checks in order:
 *   1. Time of day (IST 11AM–7PM for all channels)
 *   2. Monthly cap (max 4/student/month across all sources)
 *   3. Phase-based cooldown (since last notification)
 *   4. Phase-based max messages in this phase
 */
export async function canNotifyFee(params: {
  studentId: string
  organizationId: string
  daysOverdue: number
  hoursSinceLastNotification: number
  isVoiceCall: boolean
}): Promise<ThrottleResult> {
  const phase = getPhase(params.daysOverdue)

  // 1. Time-of-day check
  const timeCheck = checkTimeOfDay(params.isVoiceCall)
  if (!timeCheck.allowed) {
    return {
      allowed: false,
      reason: timeCheck.reason,
      metadata: {
        phaseName: phase.name,
        monthlyCount: 0,
        maxPerMonth: MAX_PER_MONTH,
        phaseMaxMessages: phase.maxMessages,
        cooldownRemainingHours: 0,
      },
    }
  }

  // 2. Monthly cap — count ALL fee notifications this month (any source)
  const monthlyCount = await getMonthlyFeeCount(params.studentId, params.organizationId)
  if (monthlyCount >= MAX_PER_MONTH) {
    return {
      allowed: false,
      reason: `Monthly cap reached: ${monthlyCount}/${MAX_PER_MONTH} messages this month`,
      metadata: {
        phaseName: phase.name,
        monthlyCount,
        maxPerMonth: MAX_PER_MONTH,
        phaseMaxMessages: phase.maxMessages,
        cooldownRemainingHours: 0,
      },
    }
  }

  // 3. Phase-based cooldown (hours since last notification vs phase cooldown days)
  const cooldownHours = phase.cooldownDays * 24
  const cooldownRemaining = Math.max(0, cooldownHours - params.hoursSinceLastNotification)
  if (params.hoursSinceLastNotification < cooldownHours) {
    return {
      allowed: false,
      reason: `Cooldown active (${phase.name} phase): ${params.hoursSinceLastNotification.toFixed(0)}h since last, need ${cooldownHours}h (${cooldownRemaining.toFixed(0)}h remaining)`,
      metadata: {
        phaseName: phase.name,
        monthlyCount,
        maxPerMonth: MAX_PER_MONTH,
        phaseMaxMessages: phase.maxMessages,
        cooldownRemainingHours: Math.round(cooldownRemaining),
      },
    }
  }

  return {
    allowed: true,
    metadata: {
      phaseName: phase.name,
      monthlyCount,
      maxPerMonth: MAX_PER_MONTH,
      phaseMaxMessages: phase.maxMessages,
      cooldownRemainingHours: 0,
    },
  }
}
