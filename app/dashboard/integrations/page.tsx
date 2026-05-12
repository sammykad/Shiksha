// src/components/dashboard/integration/integrations-page.tsx
import type React from 'react';
import { Zap, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { WhatsAppIcon } from '@/public/icons/WhatsAppIcon';
import { getIntegrationStatuses } from '@/lib/data/integration/integrations';
import IntegrationDialogWrapper from '@/components/dashboard/integration/integration-dialog-wrapper';
import { FacebookIcon } from '@/public/icons/FacebookIcon';

// This is now a SERVER COMPONENT — fetches real state
export default async function IntegrationsPage() {
  const meta = await getIntegrationStatuses();
  // smtp

  const integrations = [
    {
      id: 'facebook-ads',
      name: 'Facebook Ads',
      description: 'Sync lead ads automatically via OAuth',
      icon: <FacebookIcon className="w-8 h-8" />,
      connected: !!meta?.isActive,
      connectedMeta: meta?.isActive ? {
        pageName: meta.pageName,
        connectedAt: meta.connectedAt,
        lastSyncAt: meta.lastSyncAt,
      } : undefined,
    },
    // {
    //   id: 'smtp',
    //   name: 'SMTP',
    //   description: 'Send emails directly from your CRM',
    //   icon: <Lock className="w-8 h-8" />,
    //   connected: !!smtp?.isActive,
    //   connectedSmtp: smtp?.isActive ? { host: smtp.host, email: smtp.email } : undefined,
    // },
    {
      id: 'smtp',
      name: 'SMTP',
      description: 'Send emails directly from your CRM',
      icon: <Lock className="w-8 h-8" />,
      connected: false,
      comingSoon: true,
    },
    {
      id: 'google-forms',
      name: 'Google Forms',
      description: 'Import form responses automatically',
      icon: <Zap className="w-8 h-8" />,
      connected: false,
    },
    {
      id: 'whatsapp-business',
      name: 'WhatsApp Business',
      description: 'Message leads directly on WhatsApp',
      icon: <WhatsAppIcon className="w-8 h-8" />,
      connected: false,
      comingSoon: true,
    },
  ];

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="px-2">
      <PageHeader
        title="Integrations"
        description="Connect your tools to sync leads and automate your workflow."
        icon={Zap}
        actions={
          <>
            <div className="flex items-center gap-2 text-sm flex-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-muted-foreground">
                {connectedCount}/{integrations.length} Connected
              </span>
            </div>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {integrations.map(integration => (
          <IntegrationDialogWrapper key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
}