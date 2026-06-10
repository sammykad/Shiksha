interface PaymentRecord {
  id: string
  amount: number
  paymentDate: Date
  status: string
  method: string
}

export function calculateDaysOverdue(dueDate: Date): number {
  const diff = Date.now() - dueDate.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export function calculateDaysSinceLastPayment(payments: PaymentRecord[]): number {
  if (payments.length === 0) return Infinity
  return Math.floor(
    (Date.now() - payments[0].paymentDate.getTime()) / (1000 * 60 * 60 * 24)
  )
}

export function detectPaymentPattern(
  payments: PaymentRecord[]
): 'REGULAR' | 'IRREGULAR' | 'NEVER_PAID' | 'PARTIAL_PAYER' {
  if (payments.length === 0) return 'NEVER_PAID'
  if (payments.length === 1) return 'PARTIAL_PAYER'

  const gaps: number[] = []
  for (let i = 0; i < payments.length - 1; i++) {
    const diff = Math.abs(
      payments[i].paymentDate.getTime() - payments[i + 1].paymentDate.getTime()
    )
    gaps.push(diff / (1000 * 60 * 60 * 24))
  }

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length

  return variance < 100 ? 'REGULAR' : 'IRREGULAR'
}

export function calculateRiskScore(
  pattern: string,
  daysOverdue: number,
  attempts: number,
  pendingAmount: number,
  totalFee: number
): number {
  let score = 0

  if (pattern === 'NEVER_PAID') score += 30
  else if (pattern === 'IRREGULAR') score += 20
  else if (pattern === 'PARTIAL_PAYER') score += 10

  score += Math.min(40, daysOverdue / 3)
  score += Math.min(20, attempts * 5)

  const pendingRatio = totalFee > 0 ? pendingAmount / totalFee : 0
  score += pendingRatio * 10

  return Math.min(100, Math.round(score))
}

export function getRiskLevel(
  score: number,
  thresholds: { low: number; medium: number; high: number }
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score < thresholds.low) return 'LOW'
  if (score < thresholds.medium) return 'MEDIUM'
  if (score < thresholds.high) return 'HIGH'
  return 'CRITICAL'
}

export function determineSentiment(
  pattern: string,
  daysSinceLastPayment: number,
  notificationAttempts: number
): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'CRITICAL' {
  if (pattern === 'REGULAR' && daysSinceLastPayment < 30) return 'POSITIVE'
  if (pattern === 'NEVER_PAID' || daysSinceLastPayment > 90) return 'CRITICAL'
  if (notificationAttempts >= 3 && daysSinceLastPayment > 60) return 'NEGATIVE'
  return 'NEUTRAL'
}

export function pickScenario(daysOverdue: number, riskLevel: string) {
  if (daysOverdue >= 60 || riskLevel === 'CRITICAL') return 'overdue'
  if (daysOverdue >= 30 || riskLevel === 'HIGH') return 'overdue'
  if (daysOverdue >= 8 || riskLevel === 'MEDIUM') return 'dueToday'
  if (daysOverdue >= 1) return 'friendlyReminder'
  return 'friendlyReminder'
}

export function selectChannel(
  riskLevel: string,
  notificationAttempts: number,
  maxAttempts: number,
  config: {
    enableEmailReminders: boolean
    enableSMSReminders: boolean
    enableWhatsApp: boolean
    enableVoiceCalls: boolean
  }
): 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE_CALL' {
  if (notificationAttempts >= maxAttempts && config.enableVoiceCalls) {
    return 'VOICE_CALL'
  }
  if ((riskLevel === 'CRITICAL' || riskLevel === 'HIGH') && config.enableWhatsApp) {
    return 'WHATSAPP'
  }
  if (riskLevel === 'HIGH' && config.enableSMSReminders) return 'SMS'
  if (riskLevel === 'MEDIUM' && config.enableSMSReminders) return 'SMS'
  if (config.enableEmailReminders) return 'EMAIL'
  return 'SMS'
}
