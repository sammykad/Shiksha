// src/components/dashboard/integration/integration-dialog-wrapper.tsx
// Thin client wrapper — keeps the grid card interactive while the page stays server
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import IntegrationDialog from './integration-dialog';

export default function IntegrationDialogWrapper({ integration }: { integration: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`group relative rounded-xl border transition-all duration-300 p-6 ${integration.comingSoon
          ? 'border-border bg-card/50 opacity-60 cursor-not-allowed'
          : 'border-border bg-card hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5'
        }`}>
        {integration.comingSoon && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">Coming Soon</span>
          </div>
        )}

        <div className={`mb-4 inline-flex p-3 rounded-lg ${integration.comingSoon ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors'
          }`}>
          {integration.icon}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
          <p className="text-sm text-muted-foreground">{integration.description}</p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {integration.connected ? (
              <><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-green-600 dark:text-green-400">Connected</span></>
            ) : integration.comingSoon ? (
              <><div className="w-2 h-2 rounded-full bg-muted-foreground" /><span className="text-muted-foreground">Unavailable</span></>
            ) : (
              <><div className="w-2 h-2 rounded-full bg-muted-foreground" /><span className="text-muted-foreground">Not Connected</span></>
            )}
          </div>

          <Button
            onClick={() => !integration.comingSoon && setOpen(true)}
            disabled={integration.comingSoon}
            variant={integration.connected ? 'outline' : 'default'}
            size="sm"
            className="gap-2"
          >
            {integration.comingSoon ? 'Coming Soon' : integration.connected ? <>Manage <ArrowRight className="w-3.5 h-3.5" /></> : <>Connect <ArrowRight className="w-3.5 h-3.5" /></>}
          </Button>
        </div>
      </div>

      <IntegrationDialog integration={integration} open={open} onOpenChange={setOpen} />
    </>
  );
}