'use client';

import { useTransition } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ensureDefaultFeeSenseAgent } from '@/lib/data/ai-agents/agent-actions';

export function CreateDefaultAgentButton() {
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(() => {
      ensureDefaultFeeSenseAgent()
        .then((result) => {
          toast.success(result.message);
        })
        .catch((error) => {
          toast.error('Could not create agent', {
            description:
              error instanceof Error ? error.message : 'Please try again.',
          });
        });
    });
  };

  return (
    <Button onClick={handleCreate} disabled={isPending} className="gap-2">
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bot className="size-4" />
      )}
      {isPending ? 'Creating agent...' : 'Create FeeSense Agent'}
    </Button>
  );
}
