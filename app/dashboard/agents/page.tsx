import prisma from '@/lib/db';
import { getOrganizationId } from '@/lib/organization';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Bot,
  Clock3,
} from 'lucide-react';
import AgentCard from '@/components/dashboard/agents/agent-card';
import AgentSplineEmpty from '@/components/dashboard/agents/agent-spline-empty';
import AgentsHeroBanner from '@/components/dashboard/agents/agents-hero-banner';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

type AgentCardData = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  runFrequency: string;
  scheduleTime: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastRunAt: Date | null;
  config: { config: Record<string, unknown> } | null;
};

const page = async () => {
  const organizationId = await getOrganizationId();
  const [agents, last24hRuns] = await Promise.all([
    prisma.aiAgent.findMany({
      where: { organizationId },
      include: { config: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.aiAgentExecutionLog.count({
      where: {
        agent: { organizationId },
        startedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const typedAgents = agents as unknown as AgentCardData[];
  const activeCount = agents.filter(a => a.status === 'ACTIVE').length;
  const totalRuns = agents.reduce((sum, a) => sum + a.totalRuns, 0);
  const successRate = agents.length > 0
    ? Math.round((agents.reduce((sum, a) => sum + a.successfulRuns, 0) / Math.max(totalRuns, 1)) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <AgentsHeroBanner activeAgents={activeCount} totalAgents={agents.length} />

      <Card className="border-border/70">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Total Agents', value: agents.length, icon: Activity, tone: 'bg-blue-50 text-blue-700', detail: 'Across your school' },
              { label: 'Active', value: activeCount, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700', detail: 'Currently enabled' },
              { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, tone: 'bg-violet-50 text-violet-700', detail: 'All tracked runs' },
              { label: 'Last 24h Runs', value: last24hRuns, icon: Clock3, tone: 'bg-amber-50 text-amber-700', detail: 'Completed activity' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-3">
                <div className={`rounded-md p-2 ${stat.tone}`}>
                  <stat.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{stat.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {agents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {typedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <Card className="relative overflow-hidden border-dashed border-blue-200/60 bg-[radial-gradient(circle_at_72%_40%,rgba(14,165,233,0.12),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#edf7ff_100%)]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.24] [background-image:linear-gradient(to_right,rgba(59,130,246,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.16)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-200/20 blur-3xl" />
          <CardContent className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-start gap-4">
              <AgentSplineEmpty />
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-md border border-blue-200/80 bg-white/85 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm shadow-blue-100/60">
                  <Bot className="size-3.5" />
                  AI Team
                </div>
                <h2 className="text-lg font-semibold text-foreground">Your AI agents haven't been set up yet</h2>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  FeeSense and Attendance Monitor agents are created automatically during onboarding. If you&apos;re seeing this, contact your institution admin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default page;
