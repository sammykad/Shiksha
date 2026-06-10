import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  Phone,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { AgentActivationDialog } from '@/components/dashboard/agents/activate-agent-modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';
import Link from 'next/link';
import { RunAgentButton } from './run-agent-button';
import { GmailIcon } from '@/public/icons/GmailIcon';
import { WhatsApp } from '@/components/website/Icons';

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string | null
    status: string
    runFrequency: string
    scheduleTime: string
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastRunAt: Date | null
    config?: {
      config: Record<string, unknown>
    } | null
  }
}

type AgentChannelConfig = {
  channels?: Partial<Record<'whatsapp' | 'sms' | 'email' | 'voice', boolean>>
}

function getChannel(
  config: Record<string, unknown> | null | undefined,
  channel: keyof NonNullable<AgentChannelConfig['channels']>
): boolean {
  const channels = (config as AgentChannelConfig | null | undefined)?.channels
  return channels?.[channel] === true
}

const getSuccessRate = (total: number, successful: number) => {
  if (total === 0) return 0;
  return Math.round((successful / total) * 100);
};

const formatFrequency = (frequency: string) => {
  if (!frequency) return 'Not scheduled';
  const label = frequency.toLowerCase().replaceAll('_', ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatDateTime = (value: Date | null) => {
  if (!value) return 'Not run yet';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(value);
};

const getAgentVisual = (name: string) => {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('attendance')) {
    return {
      src: '/images/agents/attendance-robot.png',
      tone: 'from-sky-50 to-blue-50',
      accent: 'text-blue-700',
    };
  }

  if (normalizedName.includes('report')) {
    return {
      src: '/images/agents/reports-robot.png',
      tone: 'from-violet-50 to-purple-50',
      accent: 'text-violet-700',
    };
  }

  if (normalizedName.includes('notice')) {
    return {
      src: '/images/agents/notice-robot.png',
      tone: 'from-amber-50 to-orange-50',
      accent: 'text-amber-700',
    };
  }

  return {
    src: '/images/agents/feesense-robot.png',
    tone: 'from-emerald-50 to-green-50',
    accent: 'text-emerald-700',
  };
};

export default function AgentCard({ agent }: AgentCardProps) {
  const isActive = agent.status === 'ACTIVE'
  const successRate = getSuccessRate(agent.totalRuns, agent.successfulRuns);
  const visual = getAgentVisual(agent.name);
  const rawConfig = agent.config?.config ?? {}
  const channels = [
    {
      label: 'WhatsApp',
      enabled: getChannel(rawConfig, 'whatsapp'),
      icon: <WhatsApp className="size-3.5 text-emerald-600" />,
      activeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    {
      label: 'SMS',
      enabled: getChannel(rawConfig, 'sms'),
      icon: <Bell className="size-3.5 text-blue-500" />,
      activeClass: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    {
      label: 'Email',
      enabled: getChannel(rawConfig, 'email'),
      icon: <GmailIcon width={14} height={14} />,
      activeClass: 'border-violet-200 bg-violet-50 text-violet-700',
    },
    {
      label: 'Call',
      enabled: getChannel(rawConfig, 'voice'),
      icon: <Phone className="size-3.5 text-amber-500" />,
      activeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    },
  ];
  const enabledChannels = channels.filter((channel) => channel.enabled);

  return (
    <Card className="group relative overflow-hidden border border-border/70 bg-card transition-all duration-200 hover:border-primary/25 hover:shadow-sm">
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div
            className={`relative flex size-14 shrink-0 items-end justify-center overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br ${visual.tone}`}
          >
            <Image
              src={visual.src}
              alt={`${agent.name} robot avatar`}
              fill
              className="object-contain p-1"
              sizes="56px"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="block truncate text-base font-semibold leading-tight text-foreground transition-colors hover:text-primary"
                >
                  {agent.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isActive ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <XCircle className="size-3" />
                    )}
                    {isActive ? 'Active' : 'Paused'}
                  </span>
                  <span>{formatFrequency(agent.runFrequency)}</span>
                  <span>{agent.scheduleTime || '23:00'} IST</span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex shrink-0 items-center gap-1.5 rounded-md border border-border/70 bg-background px-2 py-1 transition-colors hover:bg-muted/50"
                    aria-label={`Toggle ${agent.name} agent`}
                  >
                    <span
                      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${
                        isActive ? 'bg-primary' : 'bg-input'
                      }`}
                      aria-hidden
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <VisuallyHidden>
                    <DialogTitle>{isActive ? 'Deactivate' : 'Activate'} {agent.name}</DialogTitle>
                  </VisuallyHidden>
                  <VisuallyHidden>
                    <DialogDescription>
                      Confirm {isActive ? 'deactivation' : 'activation'} of {agent.name}
                    </DialogDescription>
                  </VisuallyHidden>
                  <AgentActivationDialog agent={agent} />
                </DialogContent>
              </Dialog>
            </div>

            {agent.description && (
              <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                {agent.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(enabledChannels.length > 0 ? channels : channels.slice(0, 4)).map((channel) => (
            <div
              key={channel.label}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
                channel.enabled
                  ? channel.activeClass
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
              }`}
            >
              <span className="flex size-3.5 items-center justify-center opacity-90">
                {channel.icon}
              </span>
              <span className="truncate">{channel.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 divide-x divide-border/60 rounded-lg border border-border/60 bg-muted/20">
          <div className="min-w-0 px-3 py-2.5">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <TrendingUp className="size-3" />
              Success
            </p>
            <p className={`text-sm font-semibold ${visual.accent}`}>
              {successRate}%
            </p>
          </div>
          <div className="min-w-0 px-3 py-2.5">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarClock className="size-3" />
              Runs
            </p>
            <p className="text-sm font-semibold text-foreground">
              {agent.totalRuns}
            </p>
          </div>
          <div className="min-w-0 px-3 py-2.5">
            <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock3 className="size-3" />
              Last Run
            </p>
            <p className="truncate text-sm font-semibold text-foreground" title={formatDateTime(agent.lastRunAt)}>
              {formatDateTime(agent.lastRunAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <Button
            asChild
            size="sm"
            className="h-9 justify-center gap-2"
          >
            <Link href={`/dashboard/agents/${agent.id}`}>
              <Eye className="size-4" />
              View Details
            </Link>
          </Button>
          <RunAgentButton
            agentId={agent.id}
            disabled={!isActive}
            className="px-3"
          />

        </div>
      </div>
    </Card>
  );
}
