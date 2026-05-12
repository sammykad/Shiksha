'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { FeeSenseAgent } from '@/generated/prisma/client';
import { toggleAgentActivation } from '@/lib/data/ai-agents/toggle-agent-activation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AgentActivationDialogProps {
  agent: FeeSenseAgent;
}

export function AgentActivationDialog({ agent }: AgentActivationDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState<boolean>(!!agent.isActive);

  const onSubmit = () => {
    startTransition(() => {
      toggleAgentActivation(agent.id)
        .then(() => {
          setIsActive((prev) => {
            const next = !prev;
            if (next) {
              toast.success(`"${agent.name}" activated`);
            } else {
              toast.info(`"${agent.name}" deactivated`);
            }
            return next;
          });
        })
        .catch((error) => {
          toast.error('Something went wrong', {
            description:
              error instanceof Error ? error.message : 'Please try again.',
          });
        });
    });
  };

  const deactivating = isActive;

  return (
    <div className="space-y-5 pt-2">

      {/* Agent info */}
      <div>
        <p className="text-sm font-medium text-foreground">{agent.name}</p>
        {agent.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {agent.description}
          </p>
        )}
      </div>

      {/* Capabilities */}
      {agent.capabilities?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            What this agent does
          </p>
          <ul className="space-y-1.5">
            {agent.capabilities.map((capability, index) => (
              <li key={index} className="flex items-start gap-2">
                {deactivating ? (
                  <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <span className="text-sm text-muted-foreground">{capability}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status note */}
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
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
            <><Loader2 className="w-4 h-4 animate-spin" />{deactivating ? 'Deactivating...' : 'Activating...'}</>
          ) : (
            deactivating ? 'Deactivate' : 'Activate'
          )}
        </Button>
      </div>

    </div>
  );
}