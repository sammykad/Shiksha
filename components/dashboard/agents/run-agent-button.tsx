'use client';

import { useTransition } from 'react';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { runAgentNow } from '@/lib/ai-agents/run-agent-now';

interface RunAgentButtonProps {
  agentId: string;
  disabled?: boolean;
  className?: string;
}

export function RunAgentButton({ agentId, disabled, className }: RunAgentButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRun = () => {
    startTransition(async () => {
      try {
        const result = await runAgentNow(agentId);
        if (result.success) {
          toast.success('Agent run triggered', {
            description: 'Check back in a moment for results.',
          });
        } else {
          throw new Error(result.error ?? 'Run failed');
        }
      } catch (error) {
        toast.error('Failed to trigger run', {
          description: error instanceof Error ? error.message : 'Please try again.',
        });
      }
    });
  };

  return (
    <Button
      size="sm"
      className={cn('h-9 gap-2', className)}
      onClick={handleRun}
      disabled={disabled || isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Play className="size-4" />
      )}
      {isPending ? 'Running...' : 'Run Now'}
    </Button>
  );
}
