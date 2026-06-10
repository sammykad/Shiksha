import prisma from '@/lib/db'
import { notify } from '@/lib/notifications/notify'
import { canNotifyFee } from '@/lib/notifications/throttle'
import {
  detectPaymentPattern,
  calculateDaysSinceLastPayment,
  calculateRiskScore,
  getRiskLevel,
  determineSentiment,
  selectChannel,
  pickScenario,
} from './helpers'

export type StudentFeeData = {
  studentId: string
  studentName: string
  studentEmail: string
  parentId: string
  parentPhone: string
  parentEmail: string
  feeId: string
  feeCategoryName: string
  pendingAmount: number
  totalFee: number
  daysOverdue: number
  dueDate: string
  hoursSinceLastNotification: number
  paymentHistory: Array<{ id: string; amount: number; paymentDate: string; status: string; method: string }>
  notificationHistory: Array<{ id: string; channel: string; status: string; sentAt: string; type: string }>
}

export type FeeSenseConfig = {
  riskThresholds: { low: number; medium: number; high: number }
  notification: { maxAttempts: number; voiceCallThreshold: number; cooldownHours?: number }
  channels: { email: boolean; sms: boolean; whatsapp: boolean; voice: boolean }
  throttle?: {
    monthlyCap?: number
    notificationWindow?: { startHour: number; endHour: number }
    voiceWindow?: { startHour: number; endHour: number }
  }
}

export type StudentBrief = {
  studentId: string; studentName: string; feeId: string
  feeCategoryName: string; pendingAmount: number; dueDate: string
  parentId: string; parentPhone: string; parentEmail: string; daysOverdue: number
}

export type StudentAnalysis = {
  studentId: string
  studentName: string
  riskScore: number
  riskLevel: string
  paymentPattern: string
  sentiment: string
  recommendedChannel: string
  problems: string[]
  notificationAttempts: number
  daysSinceLastPayment: number
  daysOverdue: number
  pendingAmount: number
}

export type GroupMap = Record<string, StudentBrief[]>

export type ClassifyResult = {
  groups: GroupMap
  analyses: StudentAnalysis[]
  summary: Record<string, number>
  classifySkipped: number
}

export type SendResult = { groupName: string; sent: number; skipped: number; errors: number }

export type ChunkResult = {
  sent: number
  skipped: number
  errors: number
  voiceCallScheduled: number
}

/** Classify all students into groups based on risk + throttle rules. */
export async function classifyStudents(
  students: StudentFeeData[],
  config: FeeSenseConfig,
  organizationId: string,
): Promise<ClassifyResult> {
  const groups: GroupMap = { friendlyReminder: [], dueToday: [], overdue: [], voiceCall: [], skipped: [] }
  const analyses: StudentAnalysis[] = []
  const summary: Record<string, number> = {}

  for (const s of students) {
    const paymentPattern = detectPaymentPattern(
      s.paymentHistory.map(p => ({ ...p, paymentDate: new Date(p.paymentDate) }))
    )
    const notifAttempts = s.notificationHistory.filter(
      n => n.status === 'SENT' || n.status === 'DELIVERED'
    ).length
    const riskScore = calculateRiskScore(paymentPattern, s.daysOverdue, notifAttempts, s.pendingAmount, s.totalFee)
    const riskLevel = getRiskLevel(riskScore, config.riskThresholds)
    const recommendedChannel = selectChannel(riskLevel, notifAttempts, config.notification.maxAttempts, {
      enableEmailReminders: config.channels.email,
      enableSMSReminders: config.channels.sms,
      enableWhatsApp: config.channels.whatsapp,
      enableVoiceCalls: config.channels.voice,
    })
    const daysSinceLastPayment = calculateDaysSinceLastPayment(
      s.paymentHistory.map(p => ({ ...p, paymentDate: new Date(p.paymentDate) }))
    )
    const sentiment = determineSentiment(paymentPattern, daysSinceLastPayment, notifAttempts)

    const problems: string[] = []
    if (paymentPattern === 'NEVER_PAID') problems.push('No payment history')
    if (notifAttempts >= 3) problems.push(`${notifAttempts} reminders ignored`)
    if (s.daysOverdue > 30) problems.push(`${s.daysOverdue} days overdue`)
    if (s.paymentHistory.some(p => p.status === 'FAILED')) problems.push('Previous payments failed')
    if (!s.parentId) problems.push('No parent linked')
    if (!s.parentPhone && !s.parentEmail) problems.push('Missing contact')
    if (s.parentPhone && !/^[6-9]\d{9}$/.test(s.parentPhone.replace(/\D/g, ''))) problems.push('Invalid parent phone')

    analyses.push({ studentId: s.studentId, studentName: s.studentName, riskScore, riskLevel, paymentPattern, sentiment, recommendedChannel, problems, notificationAttempts: notifAttempts, daysSinceLastPayment, daysOverdue: s.daysOverdue, pendingAmount: s.pendingAmount })

    if (!s.parentId) { groups.skipped.push(mapBrief(s)); summary['no-parent'] = (summary['no-parent'] ?? 0) + 1; continue }

    if (!s.parentPhone && !s.parentEmail) {
      groups.skipped.push(mapBrief(s)); summary['no-contact'] = (summary['no-contact'] ?? 0) + 1; continue
    }

    const cleanPhone = s.parentPhone?.replace(/\D/g, '') ?? ''
    const isIndianPhone = !cleanPhone || /^[6-9]\d{9}$/.test(cleanPhone)
    if (s.parentPhone && !isIndianPhone) {
      groups.skipped.push(mapBrief(s)); summary['invalid-phone'] = (summary['invalid-phone'] ?? 0) + 1; continue
    }

    // Skip if all notification channels are disabled in config
    const hasChannel = config.channels.email || config.channels.sms || config.channels.whatsapp || config.channels.voice
    if (!hasChannel) {
      groups.skipped.push(mapBrief(s)); summary['no-channels'] = (summary['no-channels'] ?? 0) + 1; continue
    }

    const throttle = await canNotifyFee({
      studentId: s.studentId, organizationId, daysOverdue: s.daysOverdue,
      hoursSinceLastNotification: s.hoursSinceLastNotification,
      isVoiceCall: recommendedChannel === 'VOICE_CALL',
    })
    if (!throttle.allowed) {
      groups.skipped.push(mapBrief(s))
      const label = throttle.reason!.split(/[(:]/)[0].trim()
      summary[label] = (summary[label] ?? 0) + 1
      continue
    }

    const group = recommendedChannel === 'VOICE_CALL' ? 'voiceCall' : pickScenario(s.daysOverdue, riskLevel)
    groups[group].push(mapBrief(s))
  }

  const classifySkipped = Object.values(summary).reduce((a, b) => a + b, 0)
  return { groups, analyses, summary, classifySkipped }
}

function mapBrief(s: StudentFeeData): StudentBrief {
  return {
    studentId: s.studentId, studentName: s.studentName, feeId: s.feeId,
    feeCategoryName: s.feeCategoryName, pendingAmount: s.pendingAmount,
    dueDate: s.dueDate, parentId: s.parentId, parentPhone: s.parentPhone ?? '',
    parentEmail: s.parentEmail ?? '', daysOverdue: s.daysOverdue,
  }
}

/** Check if any fee notification was already sent to this student today (manual or automated). */
async function wasNotifiedToday(studentId: string, organizationId: string): Promise<boolean> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const existing = await prisma.notification.findFirst({
    where: {
      studentId, organizationId, type: 'FEE',
      createdAt: { gte: todayStart },
      logs: { some: { status: { in: ['SENT', 'DELIVERED'] } } },
    },
  })
  return existing !== null
}

/** Send notifications for one group. Sequential per student to respect throttle/cooldown. */
export async function sendGroup(
  groupName: string,
  students: StudentBrief[],
  organizationId: string,
): Promise<SendResult> {
  if (students.length === 0) return { groupName, sent: 0, skipped: 0, errors: 0 }

  let sent = 0, skipped = 0, errors = 0

  for (const s of students) {
    try {
      const alreadySent = await wasNotifiedToday(s.studentId, organizationId)
      if (alreadySent) { skipped++; continue }

      if (groupName === 'voiceCall') {
        await prisma.scheduledJob.create({
          data: {
            organizationId, type: 'FEE_REMINDER',
            scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
            channels: ['PUSH'], status: 'PENDING',
            data: { studentId: s.studentId, parentId: s.parentId, feeId: s.feeId, phoneNumber: s.parentPhone, callSummary: `Voice call for ${s.studentName}` },
          },
        })
        sent++
      } else {
        await notify.fee[groupName as 'friendlyReminder' | 'dueToday' | 'overdue']({
          feeId: s.feeId,
          recipients: [{ studentId: s.studentId, parentId: s.parentId }],
          variables: {
            studentName: s.studentName, feeCategoryName: s.feeCategoryName,
            amount: s.pendingAmount, dueDate: new Date(s.dueDate),
            paymentLink: undefined,
          },
        })
        sent++
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ''
      const isDup = errorMessage.includes('ALREADY_SENT') || errorMessage.includes('P2002')
      if (isDup) { skipped++ } else { errors++ }
    }
  }
  return { groupName, sent, skipped, errors }
}

/** Process all non-skipped groups for a chunk in parallel. */
export async function processChunk(
  groups: GroupMap,
  organizationId: string,
  classifySkipped?: number,
): Promise<ChunkResult> {
  const results = await Promise.all(
    Object.entries(groups)
      .filter(([name]) => name !== 'skipped')
      .map(([name, list]) => sendGroup(name, list, organizationId)),
  )

  const base = results.reduce(
    (acc, r) => ({
      sent: acc.sent + r.sent,
      skipped: acc.skipped + r.skipped,
      errors: acc.errors + r.errors,
      voiceCallScheduled: acc.voiceCallScheduled + (r.groupName === 'voiceCall' ? r.sent : 0),
    }),
    { sent: 0, skipped: 0, errors: 0, voiceCallScheduled: 0 },
  )

  return { ...base, skipped: base.skipped + (classifySkipped ?? 0) }
}
