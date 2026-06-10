import AgentDetailView from '@/components/dashboard/agents/agent-detail-view';
import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import { notFound } from 'next/navigation';

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organizationId = await getOrganizationId();

  const agent = await prisma.aiAgent.findFirst({
    where: { id, organizationId },
    include: { config: true },
  });

  if (!agent) return notFound();

  const executionLogs = await prisma.aiAgentExecutionLog.findMany({
    where: { agentId: id },
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  const reports = await prisma.aiAgentReport.findMany({
    where: { agentId: id },
    orderBy: { reportDate: 'desc' },
    take: 50,
  });

  return (
    <div className="bg-background">
      <AgentDetailView
        agent={{
          id: agent.id,
          name: agent.name,
          description: agent.description,
          status: agent.status,
          runFrequency: agent.runFrequency,
          scheduleTime: agent.scheduleTime,
          totalRuns: agent.totalRuns,
          successfulRuns: agent.successfulRuns,
          failedRuns: agent.failedRuns,
          lastRunAt: agent.lastRunAt,
          config: agent.config ? { config: agent.config.config as Record<string, unknown> } : null,
        }}
        executionLogs={executionLogs.map((log) => ({
          id: log.id,
          status: log.status,
          startedAt: log.startedAt,
          completedAt: log.completedAt,
          studentsProcessed: log.studentsProcessed,
          notificationsSent: log.notificationsSent,
          errorsCount: log.errorsCount,
          warningsCount: log.warningsCount,
          errorMessage: log.errorMessage,
        }))}
        reports={reports.map((r) => ({
          id: r.id,
          reportDate: r.reportDate,
          reportType: r.reportType,
          totalProcessed: r.totalProcessed,
          highRiskCount: r.highRiskCount,
          mediumRiskCount: r.mediumRiskCount,
          lowRiskCount: r.lowRiskCount,
          data: r.data as Record<string, unknown>,
        }))}
      />
    </div>
  );
}
