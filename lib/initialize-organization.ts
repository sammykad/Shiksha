import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma-base'
import { createTrialSubscription } from '@/lib/subscription-billing'
import { createOrganizationNotificationSettings } from '@/lib/notifications/organization-notification-settings'
import { AGENT_REGISTRY } from '@/lib/ai-agents/registry'

// ─── Data ──────────────────────────────────────────────────────────────────────

const FEE_CATEGORIES = [
  { name: 'Tuition Fee', description: 'Annual tuition fee for academic year' },
  { name: 'Transport Fee', description: 'School bus transportation charges' },
  { name: 'Examination Fee', description: 'Term examination fees' },
  { name: 'Lab Fee', description: 'Science and computer lab charges' },
  { name: 'Annual Day Fee', description: 'Annual function and cultural event charges' },
  { name: 'Library Fee', description: 'Library and book bank charges' },
  { name: 'Sports Fee', description: 'Sports equipment and coaching charges' },
  { name: 'Computer Fee', description: 'Computer lab and IT infrastructure' },
]

const GRADE_BANDS = [
  { label: 'A1', min: 91, max: 100, points: 10, desc: 'Outstanding' },
  { label: 'A2', min: 81, max: 90, points: 9, desc: 'Excellent' },
  { label: 'B1', min: 71, max: 80, points: 8, desc: 'Very Good' },
  { label: 'B2', min: 61, max: 70, points: 7, desc: 'Good' },
  { label: 'C1', min: 51, max: 60, points: 6, desc: 'Above Average' },
  { label: 'C2', min: 41, max: 50, points: 5, desc: 'Average' },
  { label: 'D', min: 33, max: 40, points: 4, desc: 'Below Average' },
  { label: 'E', min: 0, max: 32, points: 0, desc: 'Fail' },
]

const GRADES_CONFIG = [
  { name: 'Grade 1', sections: ['A', 'B'], subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Art', 'Physical Education'] },
  { name: 'Grade 2', sections: ['A', 'B'], subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Art', 'Physical Education'] },
  { name: 'Grade 3', sections: ['A', 'B'], subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Art', 'Physical Education'] },
  { name: 'Grade 4', sections: ['A', 'B'], subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Physical Education'] },
  { name: 'Grade 5', sections: ['A', 'B'], subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Art', 'Physical Education'] },
  { name: 'Grade 6', sections: ['A', 'B', 'C'], subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'] },
  { name: 'Grade 7', sections: ['A', 'B', 'C'], subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'] },
  { name: 'Grade 8', sections: ['A', 'B', 'C'], subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'] },
  { name: 'Grade 9', sections: ['A', 'B'], subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'] },
  { name: 'Grade 10', sections: ['A', 'B'], subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit', 'Art', 'Physical Education'] },
]

const HOLIDAYS = [
  { name: 'Republic Day', start: new Date(new Date().getFullYear(), 0, 26), end: new Date(new Date().getFullYear(), 0, 26), reason: 'National Holiday' },
  { name: 'Holi', start: new Date(new Date().getFullYear(), 2, 14), end: new Date(new Date().getFullYear(), 2, 15), reason: 'Festival Holidays' },
  { name: 'Independence Day', start: new Date(new Date().getFullYear(), 7, 15), end: new Date(new Date().getFullYear(), 7, 15), reason: 'National Holiday' },
  { name: 'Gandhi Jayanti', start: new Date(new Date().getFullYear(), 9, 2), end: new Date(new Date().getFullYear(), 9, 2), reason: 'National Holiday' },
  { name: 'Dussehra', start: new Date(new Date().getFullYear(), 9, 1), end: new Date(new Date().getFullYear(), 9, 1), reason: 'Festival Holidays' },
  { name: 'Diwali Break', start: new Date(new Date().getFullYear(), 9, 20), end: new Date(new Date().getFullYear(), 9, 24), reason: 'Festival Holidays' },
  { name: 'Christmas Break', start: new Date(new Date().getFullYear(), 11, 25), end: new Date(new Date().getFullYear(), 11, 31), reason: 'Winter Holidays' },
  { name: 'Summer Vacation', start: new Date(new Date().getFullYear() + 1, 4, 15), end: new Date(new Date().getFullYear() + 1, 5, 30), reason: 'Summer Break' },
]

// ─── Individual Seeders ────────────────────────────────────────────────────────

async function createAcademicYear(orgId: string, userId: string) {
  const now = new Date()
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const name = `${startYear}-${String(startYear + 1).slice(-2)}`

  await prisma.academicYear.upsert({
    where: { organizationId_name: { organizationId: orgId, name } },
    update: { isCurrent: true },
    create: {
      organizationId: orgId,
      name,
      startDate: new Date(startYear, 3, 1),
      endDate: new Date(startYear + 1, 2, 31),
      type: 'ANNUAL' as const,
      isCurrent: true,
      createdBy: userId,
    },
  })
}

async function seedFeeCategories(orgId: string, academicYearId: string) {
  for (const fc of FEE_CATEGORIES) {
    await prisma.feeCategory.create({
      data: { name: fc.name, description: fc.description, organizationId: orgId, academicYearId },
    })
  }
}

async function seedGradingScale(orgId: string) {
  const scale = await prisma.gradingScale.create({
    data: {
      name: 'CBSE Secondary Grading System',
      organizationId: orgId,
      isDefault: true,
      rounding: 'NEAREST',
      passThreshold: 33.0,
      pointsMode: 'GPA',
      allowGrace: true,
      maxGraceMarks: 3,
    },
  })

  for (const band of GRADE_BANDS) {
    await prisma.gradeBand.create({
      data: {
        gradingScaleId: scale.id,
        label: band.label,
        minPercentage: band.min,
        maxPercentage: band.max,
        points: band.points,
        description: band.desc,
      },
    })
  }
}

async function seedGradesSectionsSubjects(orgId: string) {
  for (const config of GRADES_CONFIG) {
    const grade = await prisma.grade.create({
      data: { grade: config.name, organizationId: orgId },
    })

    for (const sectionName of config.sections) {
      await prisma.section.create({
        data: { name: sectionName, gradeId: grade.id, organizationId: orgId },
      })
    }

    const gradeNum = config.name.replace('Grade ', '')
    for (const subjectName of config.subjects) {
      await prisma.subject.create({
        data: {
          name: subjectName,
          code: `${gradeNum}${subjectName.substring(0, 3).toUpperCase()}`,
          description: `${subjectName} for ${config.name}`,
          organizationId: orgId,
        },
      })
    }
  }
}

function getNextRunAt(): Date {
  const next = new Date()
  next.setHours(23, 0, 0, 0)
  if (next <= new Date()) next.setDate(next.getDate() + 1)
  return next
}

/** Sync agents from registry — deletes stale entries, creates missing ones. */
async function seedDefaultAgents(orgId: string, userId: string) {
  const existingAgents = await prisma.aiAgent.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
  })
  const existingNames = new Set(existingAgents.map(a => a.name))
  const registryNames = new Set(Object.values(AGENT_REGISTRY).map(e => e.name))

  // Delete stale agents (no longer in registry)
  const staleIds = existingAgents.filter(a => !registryNames.has(a.name)).map(a => a.id)
  if (staleIds.length > 0) {
    await prisma.aiAgentReport.deleteMany({ where: { agentId: { in: staleIds } } })
    await prisma.aiAgentExecutionLog.deleteMany({ where: { agentId: { in: staleIds } } })
    await prisma.aiAgentConfig.deleteMany({ where: { agentId: { in: staleIds } } })
    await prisma.aiAgent.deleteMany({ where: { id: { in: staleIds } } })
  }

  // Delete + re-create existing agents so they reflect current registry defaults
  const redoIds = existingAgents.filter(a => registryNames.has(a.name)).map(a => a.id)
  if (redoIds.length > 0) {
    await prisma.aiAgentReport.deleteMany({ where: { agentId: { in: redoIds } } })
    await prisma.aiAgentExecutionLog.deleteMany({ where: { agentId: { in: redoIds } } })
    await prisma.aiAgentConfig.deleteMany({ where: { agentId: { in: redoIds } } })
    await prisma.aiAgent.deleteMany({ where: { id: { in: redoIds } } })
  }

  // Create fresh from registry
  for (const entry of Object.values(AGENT_REGISTRY)) {
    const config: Record<string, unknown> = {
      ...entry.defaultConfig,
      report: {
        ...(entry.defaultConfig.report as Record<string, unknown> ?? {}),
        deliverTo: [userId],
      },
    }

    await prisma.aiAgent.create({
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
  }
}

async function seedHolidays(orgId: string, userId: string, academicYearId: string) {
  for (const h of HOLIDAYS) {
    await prisma.academicCalendar.create({
      data: {
        organizationId: orgId,
        name: h.name,
        startDate: h.start,
        endDate: h.end,
        type: 'PLANNED',
        reason: h.reason,
        isRecurring: true,
        createdBy: userId,
        academicYearId,
      },
    })
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────────────────

export async function initializeOrganization(orgId: string, userId: string) {
  await createAcademicYear(orgId, userId)

  const academicYear = await prisma.academicYear.findFirst({
    where: { organizationId: orgId, isCurrent: true },
    select: { id: true },
  })
  const academicYearId = academicYear!.id

  await createTrialSubscription({
    organizationId: orgId,
    createdBy: userId,
  })

  await Promise.all([
    seedFeeCategories(orgId, academicYearId),
    seedGradingScale(orgId),
    seedGradesSectionsSubjects(orgId),
    seedDefaultAgents(orgId, userId),
    seedHolidays(orgId, userId, academicYearId),
    createOrganizationNotificationSettings(orgId),
  ])
}
