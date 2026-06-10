export type AgentRegistryEntry = {
  key: string
  name: string
  description: string
  defaultConfig: Record<string, unknown>
}

export const AGENT_REGISTRY: Record<string, AgentRegistryEntry> = {
  'fee-sense': {
    key: 'fee-sense',
    name: 'FeeSense AI',
    description: 'Fee collection and payment reminders',
    defaultConfig: {
      riskThresholds: { low: 30, medium: 60, high: 80 },
      channels: { email: true, sms: true, whatsapp: true, voice: false },
      notification: { maxAttempts: 3, voiceCallThreshold: 3, cooldownHours: 24 },
      report: { deliverTo: [], channels: ['EMAIL', 'WHATSAPP'] },
      llmMaxOutputTokens: 8192,
      throttle: {
        monthlyCap: 4,
        notificationWindow: { startHour: 11, endHour: 19 },
        voiceWindow: { startHour: 11, endHour: 19 },
      },
    },
  },
  'attendance-monitor': {
    key: 'attendance-monitor',
    name: 'Attendance Monitor',
    description: 'Attendance tracking and alerts',
    defaultConfig: {
      absenceThreshold: 75,
      lookbackDays: 90,
      notifyParent: true,
      notifyTeacher: true,
      llmMaxOutputTokens: 8192,
    },
  },
}
