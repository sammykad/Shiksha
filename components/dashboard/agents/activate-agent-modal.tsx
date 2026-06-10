'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { toggleAgentActivation } from '@/lib/ai-agents/toggle-agent-activation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Capability {
  label: string
  badge?: string
}

const AGENT_CAPABILITIES: Record<string, Capability[]> = {
  'FeeSense AI': [
    { label: 'Monitors overdue fee payments' },
    { label: 'Sends payment reminders via WhatsApp, SMS, and Email' },
    { label: 'Generates daily fee collection reports' },
    { label: 'Analyzes payment patterns and identifies risk levels' },
    { label: 'Schedules voice calls for high-priority overdue fees', badge: 'META' },
  ],
  'Attendance Monitor': [
    { label: 'Tracks daily student attendance patterns' },
    { label: 'Identifies students with low attendance rates' },
    { label: 'Sends absence alerts to parents and teachers' },
    { label: 'Generates attendance summary and trend reports' },
  ],
};

function getCapabilities(name: string): Capability[] {
  return AGENT_CAPABILITIES[name] ?? [
    { label: 'Automates routine school management tasks' },
    { label: 'Sends notifications via configured channels' },
    { label: 'Generates summary reports and insights' },
    { label: 'Runs on a scheduled basis' },
  ];
}

interface AgentActivationDialogProps {
  agent: {
    id: string
    name: string
    description: string | null
    status: string
    config?: { config: Record<string, unknown> } | null
  }
}

export function AgentActivationDialog({ agent }: AgentActivationDialogProps) {
  const [isPending, startTransition] = useTransition();
  const capabilities = getCapabilities(agent.name);
  const isActive = agent.status === 'ACTIVE';

  const onSubmit = () => {
    startTransition(async () => {
      try {
        await toggleAgentActivation(agent.id)
        if (isActive) {
          toast.info(`"${agent.name}" deactivated`)
        } else {
          toast.success(`"${agent.name}" activated`)
        }
      } catch (error) {
        toast.error('Something went wrong', {
          description:
            error instanceof Error ? error.message : 'Please try again.',
        })
      }
    })
  }

  const deactivating = isActive;

  return (
    <div className="space-y-5 pt-2">

      {/* Agent info */}
      <div>
        <p className="text-sm font-medium text-foreground">{agent.name}</p>
        {agent.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {agent.description}
          </p>
        )}
      </div>

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            What this agent does
          </p>
          <ul className="space-y-1.5">
            {capabilities.map((capability, index) => (
              <li key={index} className="flex items-start gap-2">
                {deactivating ? (
                  <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                )}
                <span className="text-sm text-muted-foreground">{capability.label}</span>
                {capability.badge && (
                  <span className="ml-1.5 rounded-[3px] border border-amber-300 bg-amber-50 px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    {capability.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status note */}
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {deactivating
            ? 'Deactivating will stop all scheduled runs and notifications for this agent.'
            : 'Activating will enable scheduled runs and notifications for this agent.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <DialogClose asChild>
          <Button variant="outline" className="flex-1" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          onClick={onSubmit}
          disabled={isPending}
          variant={deactivating ? 'destructive' : 'default'}
          className="flex-1 gap-2"
        >
          {isPending ? (
            <><Loader2 className="size-4 animate-spin" />{deactivating ? 'Deactivating...' : 'Activating...'}</>
          ) : (
            deactivating ? 'Deactivate' : 'Activate'
          )}
        </Button>
      </div>

    </div>
  );
}
