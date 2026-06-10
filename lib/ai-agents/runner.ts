import prisma from '@/lib/db'
import { getActiveAcademicYearId } from '@/lib/academicYear'
import { getAgentConfig } from '@/lib/ai-agents/tools/shared/check-enabled'
import { fetchOverdueFeesPage } from '@/lib/ai-agents/tools/fee-sense/fetch-overdue-fees'
import { classifyStudents, processChunk } from '@/lib/ai-agents/tools/fee-sense/execute-workflow'
import { generateAndStoreReport, type ReportMetrics } from '@/lib/ai-agents/tools/fee-sense/generate-daily-report'
import type { StudentAnalysis } from '@/lib/ai-agents/tools/fee-sense/execute-workflow'

const PAGE_SIZE = 50

async function createExecutionLog(agentId: string, organizationId: string) {
  return prisma.aiAgentExecutionLog.create({
    data: {
      agentId,
      organizationId,
      startedAt: new Date(),
      status: 'RUNNING',
    },
  })
}

async function updateLogProgress(
  logId: string,
  data: { processedChunks: number; totalProcessed: number; totalSent: number; totalSkipped: number },
) {
  await prisma.aiAgentExecutionLog.update({
    where: { id: logId },
    data: { output: data },
  })
}

async function finalizeLog(
  logId: string,
  agentId: string,
  status: 'SUCCESS' | 'FAILED',
  errorMessage?: string,
  outputText?: string,
) {
  const statsIncrement = status === 'SUCCESS'
    ? { totalRuns: { increment: 1 }, successfulRuns: { increment: 1 } }
    : { totalRuns: { increment: 1 }, failedRuns: { increment: 1 } }

  await prisma.$transaction([
    prisma.aiAgentExecutionLog.update({
      where: { id: logId },
      data: {
        completedAt: new Date(),
        status,
        ...(errorMessage ? { errorMessage } : {}),
        ...(outputText ? { output: { summary: outputText } } : {}),
      },
    }),
    prisma.aiAgent.update({
      where: { id: agentId },
      data: {
        ...statsIncrement,
        lastRunAt: new Date(),
      },
    }),
  ])
}

/** Orchestrate a FeeSense AI run. All data logic in pure TS; LLM only for report NL. */
export async function runFeeSense(agentRecord: {
  id: string
  organizationId: string
  name: string
  llmModel: string
}) {
  if (agentRecord.name !== 'FeeSense AI') {
    throw new Error(`runFeeSense called for wrong agent type: "${agentRecord.name}"`)
  }

  console.log(`[feeSense] Starting run for "${agentRecord.name}"`, { id: agentRecord.id })

  const log = await createExecutionLog(agentRecord.id, agentRecord.organizationId)
  console.log(`[feeSense] Execution log created`, { logId: log.id })

  try {
    // 1. Check agent is enabled
    const agentCheck = await getAgentConfig(agentRecord.id)
    if (!agentCheck.enabled) throw new Error(agentCheck.message)
    console.log(`[feeSense] Agent active, config loaded`)

    // 2. Paginate through overdue fees
    const academicYearId = await getActiveAcademicYearId()
    let page = 0
    let allAnalyses: StudentAnalysis[] = []
    let totalChunkOverdue = 0
    let totalStats = { sent: 0, skipped: 0, errors: 0, voiceCallScheduled: 0 }

    while (true) {
      const feePage = await fetchOverdueFeesPage(
        agentRecord.organizationId,
        academicYearId,
        page,
      )
      if (feePage.students.length === 0) {
        console.log(`[feeSense] No overdue fees found — nothing to process`)
        break
      }

      console.log(`[feeSense] Page ${page + 1}: ${feePage.students.length} students, ₹${feePage.totalOverdue}`)

      // Classify students in this chunk
      const { groups, analyses, classifySkipped } = await classifyStudents(
        feePage.students,
        agentCheck.config as Parameters<typeof classifyStudents>[1],
        agentRecord.organizationId,
      )

      // Send notifications in parallel across all non-skipped groups
      const chunkResult = await processChunk(groups, agentRecord.organizationId, classifySkipped)

      allAnalyses.push(...analyses)
      totalChunkOverdue += feePage.totalOverdue
      totalStats.sent += chunkResult.sent
      totalStats.skipped += chunkResult.skipped
      totalStats.errors += chunkResult.errors
      totalStats.voiceCallScheduled += chunkResult.voiceCallScheduled

      // Log progress
      console.log(`[feeSense] Chunk ${page + 1} done`, {
        analysed: analyses.length,
        ...chunkResult,
      })

      await updateLogProgress(log.id, {
        processedChunks: page + 1,
        totalProcessed: allAnalyses.length,
        totalSent: totalStats.sent,
        totalSkipped: totalStats.skipped,
      })

      if (!feePage.hasMore) break
      page++
    }

    console.log(`[feeSense] All pages processed`, {
      totalStudents: allAnalyses.length,
      ...totalStats,
      totalOverdue: totalChunkOverdue,
    })

    // 3. Generate and store report
    const metrics: ReportMetrics = {
      totalStudents: allAnalyses.length,
      analyses: allAnalyses,
      sent: totalStats.sent,
      skipped: totalStats.skipped,
      errors: totalStats.errors,
      voiceCallScheduled: totalStats.voiceCallScheduled,
      totalOverdue: totalChunkOverdue,
    }

    const reportResult = await generateAndStoreReport(
      agentRecord.id,
      agentRecord.organizationId,
      metrics,
      agentRecord.llmModel,
      agentCheck.config,
    )

    // 4. Mark success
    await finalizeLog(log.id, agentRecord.id, 'SUCCESS')

    console.log(`[feeSense] Run complete`, {
      totalChunks: page + 1,
      totalStudents: allAnalyses.length,
      ...totalStats,
      reportId: reportResult.reportId,
    })

    return { success: true, logId: log.id, reportId: reportResult.reportId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[feeSense] Run FAILED`, { error: message, logId: log.id })

    await finalizeLog(log.id, agentRecord.id, 'FAILED', message)

    return { success: false, error: message, logId: log.id }
  }
}


